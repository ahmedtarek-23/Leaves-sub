import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotificationService } from './notification.service';
import { LeaveNotification, NotificationType, NotificationChannel, NotificationStatus } from '../models/leave-notification.schema';
import { LeaveRequest } from '../models/leave-request.schema';
import { LeaveStatus } from '../enums/leave-status.enum';
import { Types } from 'mongoose';

describe('NotificationService', () => {
  let service: NotificationService;
  let notificationModel: any;

  const mockEmployeeId = new Types.ObjectId();
  const mockManagerId = new Types.ObjectId();
  const mockRequestId = new Types.ObjectId();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getModelToken('LeaveNotification'),
          useValue: jest.fn(),
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    notificationModel = module.get(getModelToken('LeaveNotification'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendNotification (REQ-019, REQ-024, REQ-030)', () => {
    it('should create and send email notification', async () => {
      const mockNotification = {
        _id: new Types.ObjectId(),
        recipientId: mockEmployeeId,
        type: NotificationType.REQUEST_SUBMITTED,
        channel: NotificationChannel.EMAIL,
        status: NotificationStatus.PENDING,
        save: jest.fn()
          .mockResolvedValueOnce({
            ...mockNotification,
            status: NotificationStatus.PENDING,
          })
          .mockResolvedValueOnce({
            ...mockNotification,
            status: NotificationStatus.SENT,
            sentAt: new Date(),
          })
          .mockResolvedValueOnce({
            ...mockNotification,
            status: NotificationStatus.DELIVERED,
            deliveredAt: new Date(),
          }),
      };

      notificationModel.mockImplementation(() => mockNotification);
      jest.spyOn(service as any, 'sendEmail').mockResolvedValue(true);

      const result = await service.sendNotification(
        mockEmployeeId,
        NotificationType.REQUEST_SUBMITTED,
        NotificationChannel.EMAIL,
        'Test Subject',
        'Test Message',
        mockRequestId,
      );

      expect(result.status).toBe(NotificationStatus.DELIVERED);
      expect(mockNotification.save).toHaveBeenCalled();
    });

    it('should create and send SMS notification', async () => {
      const mockNotification = {
        _id: new Types.ObjectId(),
        recipientId: mockEmployeeId,
        type: NotificationType.REQUEST_APPROVED,
        channel: NotificationChannel.SMS,
        status: NotificationStatus.PENDING,
        save: jest.fn()
          .mockResolvedValueOnce({ ...mockNotification, status: NotificationStatus.PENDING })
          .mockResolvedValueOnce({ ...mockNotification, status: NotificationStatus.SENT, sentAt: new Date() })
          .mockResolvedValueOnce({ ...mockNotification, status: NotificationStatus.DELIVERED, deliveredAt: new Date() }),
      };

      notificationModel.mockImplementation(() => mockNotification);
      jest.spyOn(service as any, 'sendSMS').mockResolvedValue(true);

      const result = await service.sendNotification(
        mockEmployeeId,
        NotificationType.REQUEST_APPROVED,
        NotificationChannel.SMS,
        'Approved',
        'Your leave has been approved',
        mockRequestId,
      );

      expect(result.channel).toBe(NotificationChannel.SMS);
      expect(result.status).toBe(NotificationStatus.DELIVERED);
    });

    it('should handle notification failure gracefully', async () => {
      const mockNotification = {
        _id: new Types.ObjectId(),
        recipientId: mockEmployeeId,
        status: NotificationStatus.PENDING,
        save: jest.fn()
          .mockResolvedValueOnce({ ...mockNotification, status: NotificationStatus.PENDING })
          .mockResolvedValueOnce({ ...mockNotification, status: NotificationStatus.FAILED, errorMessage: 'Email service unavailable' }),
      };

      notificationModel.mockImplementation(() => mockNotification);

      // Mock sendEmail to fail
      jest.spyOn(service as any, 'sendEmail').mockRejectedValue(new Error('Email service unavailable'));

      await expect(
        service.sendNotification(
          mockEmployeeId,
          NotificationType.REQUEST_SUBMITTED,
          NotificationChannel.EMAIL,
          'Test',
          'Test',
        ),
      ).rejects.toThrow('Email service unavailable');
      
      expect(mockNotification.save).toHaveBeenCalled();
    });
  });

  describe('notifyRequestSubmitted (REQ-019)', () => {
    it('should send notification to manager when request is submitted', async () => {
      const mockRequest = {
        _id: mockRequestId,
        employeeId: mockEmployeeId,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-05'),
      } as LeaveRequest;

      jest.spyOn(service, 'sendNotification').mockResolvedValue({
        _id: new Types.ObjectId(),
        recipientId: mockManagerId,
        type: NotificationType.REQUEST_SUBMITTED,
        status: NotificationStatus.SENT,
      } as any);

      await service.notifyRequestSubmitted(mockRequest, mockManagerId);

      expect(service.sendNotification).toHaveBeenCalledWith(
        mockManagerId,
        NotificationType.REQUEST_SUBMITTED,
        NotificationChannel.EMAIL,
        'New Leave Request Submitted',
        expect.stringContaining('New leave request submitted'),
        mockRequestId,
        expect.any(Object),
      );
    });
  });

  describe('notifyRequestApproved (REQ-024)', () => {
    it('should send approval notification to employee', async () => {
      const mockRequest = {
        _id: mockRequestId,
        employeeId: mockEmployeeId,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-05'),
        status: LeaveStatus.APPROVED,
      } as LeaveRequest;

      jest.spyOn(service, 'sendNotification').mockResolvedValue({
        _id: new Types.ObjectId(),
        recipientId: mockEmployeeId,
        type: NotificationType.REQUEST_APPROVED,
        status: NotificationStatus.SENT,
      } as any);

      await service.notifyRequestApproved(mockRequest, mockEmployeeId);

      expect(service.sendNotification).toHaveBeenCalledWith(
        mockEmployeeId,
        NotificationType.REQUEST_APPROVED,
        NotificationChannel.EMAIL,
        'Leave Request Approved',
        expect.stringContaining('has been approved'),
        mockRequestId,
      );
    });
  });

  describe('notifyRequestRejected (REQ-024)', () => {
    it('should send rejection notification with reason', async () => {
      const mockRequest = {
        _id: mockRequestId,
        employeeId: mockEmployeeId,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-05'),
        status: LeaveStatus.REJECTED,
      } as LeaveRequest;

      const reason = 'Insufficient team coverage';

      jest.spyOn(service, 'sendNotification').mockResolvedValue({
        _id: new Types.ObjectId(),
        recipientId: mockEmployeeId,
        type: NotificationType.REQUEST_REJECTED,
        status: NotificationStatus.SENT,
      } as any);

      await service.notifyRequestRejected(mockRequest, mockEmployeeId, reason);

      expect(service.sendNotification).toHaveBeenCalledWith(
        mockEmployeeId,
        NotificationType.REQUEST_REJECTED,
        NotificationChannel.EMAIL,
        'Leave Request Rejected',
        expect.stringContaining(reason),
        mockRequestId,
        { reason },
      );
    });
  });

  describe('notifyYearEndProcessing (REQ-030)', () => {
    it('should send year-end processing notification', async () => {
      const year = 2024;
      const summary = {
        totalDays: 20,
        carryForward: 5,
      };

      jest.spyOn(service, 'sendNotification').mockResolvedValue({
        _id: new Types.ObjectId(),
        recipientId: mockEmployeeId,
        type: NotificationType.YEAR_END_PROCESSING,
        status: NotificationStatus.SENT,
      } as any);

      await service.notifyYearEndProcessing(mockEmployeeId, year, summary);

      expect(service.sendNotification).toHaveBeenCalledWith(
        mockEmployeeId,
        NotificationType.YEAR_END_PROCESSING,
        NotificationChannel.EMAIL,
        `Year-End Processing ${year}`,
        expect.stringContaining('Year-end leave processing completed'),
        undefined,
        { year, summary },
      );
    });
  });

  describe('getNotificationLogs', () => {
    it('should retrieve notification logs for a user', async () => {
      const mockLogs = [
        {
          _id: new Types.ObjectId(),
          recipientId: mockEmployeeId,
          type: NotificationType.REQUEST_SUBMITTED,
          status: NotificationStatus.SENT,
          createdAt: new Date(),
        },
        {
          _id: new Types.ObjectId(),
          recipientId: mockEmployeeId,
          type: NotificationType.REQUEST_APPROVED,
          status: NotificationStatus.DELIVERED,
          createdAt: new Date(),
        },
      ];

      notificationModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockLogs),
          }),
        }),
      });

      const result = await service.getNotificationLogs(mockEmployeeId, 50);

      expect(result).toHaveLength(2);
      expect(notificationModel.find).toHaveBeenCalledWith({ recipientId: mockEmployeeId });
    });
  });

  describe('Mock Email/SMS Providers', () => {
    it('should log email sending (mock)', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      await (service as any).sendEmail('test@example.com', 'Subject', 'Body');

      expect(consoleSpy).toHaveBeenCalled();
      const calls = consoleSpy.mock.calls.flat().join(' ');
      expect(calls).toContain('[MOCK EMAIL]');

      consoleSpy.mockRestore();
    });

    it('should log SMS sending (mock)', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      await (service as any).sendSMS('+1234567890', 'Message');

      expect(consoleSpy).toHaveBeenCalled();
      const calls = consoleSpy.mock.calls.flat().join(' ');
      expect(calls).toContain('[MOCK SMS]');

      consoleSpy.mockRestore();
    });
  });
});
