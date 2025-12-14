import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { LeaveStatus } from './enums/leave-status.enum';
import { Types } from 'mongoose';
import { NotificationService } from './notifications/notification.service';
import { TimeManagementService } from '../time-management/time-management.service';
import { EmployeeProfileService } from '../employee-profile/employee-profile.service';
import { PayrollExecutionService } from '../payroll-execution/payroll-execution.service';

describe('LeavesService - Comprehensive Tests', () => {
  let service: LeavesService;
  let leaveRequestModel: any;
  let leaveTypeModel: any;
  let leaveCategoryModel: any;
  let leavePolicyModel: any;
  let leaveEntitlementModel: any;
  let calendarModel: any;
  let leaveDelegationModel: any;
  let leaveAuditLogModel: any;
  let leaveNotificationModel: any;
  let leaveAccrualModel: any;
  let resetPolicyModel: any;
  let attachmentModel: any;
  let notificationService: NotificationService;

  const mockEmployeeId = new Types.ObjectId();
  const mockManagerId = new Types.ObjectId();
  const mockLeaveTypeId = new Types.ObjectId();
  const mockCategoryId = new Types.ObjectId();
  const mockRequestId = new Types.ObjectId();

  beforeEach(async () => {
    // Create comprehensive mocks - models are used as constructors
    const createMockModel = () => {
      const MockConstructor = jest.fn() as any;
      // Add static methods that models need
      MockConstructor.find = jest.fn().mockReturnValue({ 
        exec: jest.fn().mockResolvedValue([]), 
        populate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }) 
      });
      MockConstructor.findOne = jest.fn().mockReturnValue({ exec: jest.fn(), populate: jest.fn() });
      MockConstructor.findById = jest.fn().mockReturnValue({ exec: jest.fn(), populate: jest.fn() });
      MockConstructor.findByIdAndUpdate = jest.fn().mockReturnValue({ exec: jest.fn() });
      MockConstructor.findByIdAndDelete = jest.fn().mockReturnValue({ exec: jest.fn() });
      MockConstructor.findOneAndUpdate = jest.fn().mockReturnValue({ exec: jest.fn() });
      MockConstructor.countDocuments = jest.fn().mockReturnValue({ exec: jest.fn() });
      MockConstructor.create = jest.fn();
      return MockConstructor;
    };

    const mockModels = createMockModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeavesService,
        {
          provide: getModelToken('LeaveRequest'),
          useValue: mockModels,
        },
        {
          provide: getModelToken('LeaveType'),
          useValue: mockModels,
        },
        {
          provide: getModelToken('LeaveCategory'),
          useValue: mockModels,
        },
        {
          provide: getModelToken('LeavePolicy'),
          useValue: mockModels,
        },
        {
          provide: getModelToken('LeaveEntitlement'),
          useValue: mockModels,
        },
        {
          provide: getModelToken('LeaveAdjustment'),
          useValue: mockModels,
        },
        {
          provide: getModelToken('Calendar'),
          useValue: mockModels,
        },
        {
          provide: getModelToken('Attachment'),
          useValue: mockModels,
        },
        {
          provide: getModelToken('LeaveDelegation'),
          useValue: mockModels,
        },
        {
          provide: getModelToken('LeaveAuditLog'),
          useValue: mockModels,
        },
        {
          provide: getModelToken('LeaveNotification'),
          useValue: mockModels,
        },
        {
          provide: getModelToken('LeaveAccrual'),
          useValue: mockModels,
        },
        {
          provide: getModelToken('LeaveBalance'),
          useValue: mockModels,
        },
        {
          provide: getModelToken('ResetPolicy'),
          useValue: mockModels,
        },
        {
          provide: NotificationService,
          useValue: {
            notifyRequestSubmitted: jest.fn(),
            notifyRequestApproved: jest.fn(),
            notifyRequestRejected: jest.fn(),
            notifyYearEndProcessing: jest.fn(),
          },
        },
        {
          provide: TimeManagementService,
          useValue: {},
        },
        {
          provide: EmployeeProfileService,
          useValue: {
            getEmployeeProfile: jest.fn().mockResolvedValue({
              _id: mockEmployeeId,
              managerId: mockManagerId,
            }),
            getTeamMembers: jest.fn().mockResolvedValue([
              { _id: new Types.ObjectId('507f1f77bcf86cd799439011') },
              { _id: new Types.ObjectId('507f1f77bcf86cd799439012') },
            ]),
          },
        },
        {
          provide: PayrollExecutionService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<LeavesService>(LeavesService);
    leaveRequestModel = module.get(getModelToken('LeaveRequest'));
    leaveTypeModel = module.get(getModelToken('LeaveType'));
    leaveCategoryModel = module.get(getModelToken('LeaveCategory'));
    leavePolicyModel = module.get(getModelToken('LeavePolicy'));
    leaveEntitlementModel = module.get(getModelToken('LeaveEntitlement'));
    calendarModel = module.get(getModelToken('Calendar'));
    leaveDelegationModel = module.get(getModelToken('LeaveDelegation'));
    leaveAuditLogModel = module.get(getModelToken('LeaveAuditLog'));
    leaveNotificationModel = module.get(getModelToken('LeaveNotification'));
    leaveAccrualModel = module.get(getModelToken('LeaveAccrual'));
    resetPolicyModel = module.get(getModelToken('ResetPolicy'));
    attachmentModel = module.get(getModelToken('Attachment'));
    notificationService = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Leave Request Lifecycle (REQ-015, REQ-017)', () => {
    describe('submitRequest', () => {
      it('should create a leave request with PENDING status when balance is sufficient', async () => {
        const requestData = {
          employeeId: mockEmployeeId.toString(),
          leaveTypeId: mockLeaveTypeId.toString(),
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-06-05'),
          durationDays: 5,
          managerId: mockManagerId,
        };

        const mockEntitlement = {
          _id: new Types.ObjectId(),
          employeeId: mockEmployeeId,
          leaveTypeId: mockLeaveTypeId,
          remaining: 10,
        };

        const mockPolicy = {
          roundingRule: 'NO_ROUNDING',
        };

        const mockSavedRequest = {
          _id: mockRequestId,
          ...requestData,
          status: LeaveStatus.PENDING,
          dates: {
            from: requestData.startDate,
            to: requestData.endDate,
          },
          save: jest.fn(),
        };

        leaveEntitlementModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEntitlement),
        });
        leavePolicyModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockPolicy),
        });
        // Mock calendar validation - return calendar with empty blockedPeriods array
        calendarModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue({ 
            year: 2024, 
            blockedPeriods: [] 
          }),
        });
        // Mock countDocuments for checkFrequentShortLeaves (called during flagging heuristics)
        // The service calls this with employeeId as string, but the query uses ObjectId
        // Mock to return 0 to avoid flagging
        leaveRequestModel.countDocuments = jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(0),
        });
        // Mock attachment countDocuments for checkLongSickWithoutDocs
        attachmentModel.countDocuments = jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(0),
        });
        // Mock the constructor to return an object with save method
        (leaveRequestModel as jest.Mock).mockImplementation(function() {
          return {
            ...mockSavedRequest,
            save: jest.fn().mockResolvedValue(mockSavedRequest),
          };
        });

        const result = await service.submitRequest(requestData);

        expect(result.status).toBe(LeaveStatus.PENDING);
        expect(notificationService.notifyRequestSubmitted).toHaveBeenCalled();
      });

      it('should flag for HR conversion when balance is exceeded but some remains', async () => {
        const requestData = {
          employeeId: mockEmployeeId,
          leaveTypeId: mockLeaveTypeId,
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-06-10'),
          durationDays: 10,
          managerId: mockManagerId,
        };

        const mockEntitlement = {
          remaining: 5, // Less than requested
        };

        leaveEntitlementModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEntitlement),
        });
        leavePolicyModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue({ roundingRule: 'NO_ROUNDING' }),
        });
        // Mock calendar validation - return calendar with empty blockedPeriods
        calendarModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue({ 
            year: 2024, 
            blockedPeriods: [] 
          }),
        });
        // Mock the constructor to return an object with save method
        (leaveRequestModel as jest.Mock).mockReset();
        (leaveRequestModel as jest.Mock).mockImplementation(function() {
          const savedRequest = {
            _id: mockRequestId,
            ...requestData,
            requiresHRConversion: true,
            excessDays: 5,
            save: jest.fn().mockResolvedValue({
              _id: mockRequestId,
              ...requestData,
              requiresHRConversion: true,
              excessDays: 5,
            }),
          };
          return savedRequest;
        });

        const result = await service.submitRequest(requestData);

        expect(result.requiresHRConversion).toBe(true);
        expect(result.excessDays).toBe(5);
      });

      it('should throw BadRequestException when balance is zero', async () => {
        const requestData = {
          employeeId: mockEmployeeId.toString(),
          leaveTypeId: mockLeaveTypeId.toString(),
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-06-05'),
          durationDays: 5,
        };

        const mockEntitlement = {
          remaining: 0,
        };

        leaveEntitlementModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEntitlement),
        });
        leavePolicyModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue({ roundingRule: 'NO_ROUNDING' }),
        });
        // Mock calendar validation - return calendar with empty blockedPeriods
        calendarModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue({ 
            year: 2024, 
            blockedPeriods: [] 
          }),
        });

        await expect(service.submitRequest(requestData)).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe('updatePendingLeaveRequest (REQ-017)', () => {
      it('should update a PENDING leave request successfully', async () => {
        const mockRequest = {
          _id: mockRequestId,
          status: LeaveStatus.PENDING,
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-06-05'),
          durationDays: 5,
          justification: 'Old reason',
          leaveTypeId: mockLeaveTypeId,
          save: jest.fn().mockResolvedValue(true),
        };

        const updateData = {
          startDate: new Date('2024-06-10'),
          endDate: new Date('2024-06-15'),
          justification: 'New reason',
        };

        leaveRequestModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockRequest),
        });

        // Create a spy to track audit log creation
        const auditLogSaveSpy = jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(),
          action: 'UPDATE',
          performedBy: mockEmployeeId,
        });
        (leaveAuditLogModel as jest.Mock).mockImplementation(() => ({
          save: auditLogSaveSpy,
        }));

        const result = await service.updatePendingLeaveRequest(
          mockRequestId.toString(),
          updateData,
          mockEmployeeId,
        );

        expect(mockRequest.save).toHaveBeenCalled();
        // Verify audit log was created and saved
        expect((leaveAuditLogModel as jest.Mock)).toHaveBeenCalled();
        expect(auditLogSaveSpy).toHaveBeenCalled();
      });

      it('should reject update for APPROVED request', async () => {
        const mockRequest = {
          _id: mockRequestId,
          status: LeaveStatus.APPROVED,
        };

        leaveRequestModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockRequest),
        });

        await expect(
          service.updatePendingLeaveRequest(
            mockRequestId.toString(),
            { justification: 'New reason' },
            mockEmployeeId,
          ),
        ).rejects.toThrow(BadRequestException);
      });

      it('should reject update for REJECTED request', async () => {
        const mockRequest = {
          _id: mockRequestId,
          status: LeaveStatus.REJECTED,
        };

        leaveRequestModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockRequest),
        });

        await expect(
          service.updatePendingLeaveRequest(
            mockRequestId.toString(),
            { justification: 'New reason' },
            mockEmployeeId,
          ),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });

  describe('Leave Calendar Management (REQ-010)', () => {
    describe('addBlockedPeriod', () => {
      it('should add a blocked period successfully', async () => {
        const year = 2024;
        const blockedPeriodData = {
          from: new Date('2024-12-20'),
          to: new Date('2024-12-31'),
          reason: 'Year-end closure',
        };

        const mockCalendar = {
          year,
          holidays: [],
          blockedPeriods: [],
          save: jest.fn(),
        };

        calendarModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCalendar),
        });

        const result = await service.addBlockedPeriod(year, blockedPeriodData);

        expect(mockCalendar.blockedPeriods).toContainEqual(blockedPeriodData);
        expect(mockCalendar.save).toHaveBeenCalled();
      });

      it('should reject overlapping blocked periods', async () => {
        const year = 2024;
        const existingPeriod = {
          from: new Date('2024-12-15'),
          to: new Date('2024-12-25'),
          reason: 'Existing period',
        };

        const newPeriod = {
          from: new Date('2024-12-20'),
          to: new Date('2024-12-31'),
          reason: 'New period',
        };

        const mockCalendar = {
          year,
          blockedPeriods: [existingPeriod],
          save: jest.fn(),
        };

        calendarModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCalendar),
        });

        await expect(
          service.addBlockedPeriod(year, newPeriod),
        ).rejects.toThrow(BadRequestException);
      });

      it('should reject invalid date range (start >= end)', async () => {
        const year = 2024;
        const invalidPeriod = {
          from: new Date('2024-12-31'),
          to: new Date('2024-12-20'),
          reason: 'Invalid',
        };

        calendarModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue({ year, blockedPeriods: [] }),
        });

        await expect(
          service.addBlockedPeriod(year, invalidPeriod),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('validateLeaveDates', () => {
      it('should reject leave request on blocked dates', async () => {
        const year = 2024;
        const blockedPeriod = {
          from: new Date('2024-12-20'),
          to: new Date('2024-12-31'),
          reason: 'Year-end closure',
        };

        const mockCalendar = {
          year,
          blockedPeriods: [blockedPeriod],
        };

        calendarModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCalendar),
        });

        const startDate = new Date('2024-12-25');
        const endDate = new Date('2024-12-28');

        await expect(
          service.validateLeaveDates(startDate, endDate, year),
        ).rejects.toThrow(BadRequestException);
      });

      it('should allow leave request outside blocked dates', async () => {
        const year = 2024;
        const blockedPeriod = {
          from: new Date('2024-12-20'),
          to: new Date('2024-12-31'),
          reason: 'Year-end closure',
        };

        const mockCalendar = {
          year,
          blockedPeriods: [blockedPeriod],
        };

        calendarModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCalendar),
        });

        const startDate = new Date('2024-11-01');
        const endDate = new Date('2024-11-05');

        await expect(
          service.validateLeaveDates(startDate, endDate, year),
        ).resolves.not.toThrow();
      });
    });
  });

  describe('Leave Type & Category Management (REQ-011)', () => {
    describe('deleteLeaveCategory', () => {
      it('should delete category when not referenced', async () => {
        leaveCategoryModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue({ _id: mockCategoryId, name: 'Test' }),
        });

        leaveTypeModel.countDocuments.mockReturnValue({
          exec: jest.fn().mockResolvedValue(0),
        });

        leaveCategoryModel.findByIdAndDelete.mockReturnValue({
          exec: jest.fn().mockResolvedValue({}),
        });

        await service.deleteLeaveCategory(mockCategoryId.toString());

        expect(leaveCategoryModel.findByIdAndDelete).toHaveBeenCalled();
      });

      it('should prevent deletion when category is referenced by leave types', async () => {
        leaveCategoryModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue({ _id: mockCategoryId }),
        });

        leaveTypeModel.countDocuments.mockReturnValue({
          exec: jest.fn().mockResolvedValue(5), // 5 leave types using this category
        });

        await expect(
          service.deleteLeaveCategory(mockCategoryId.toString()),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('deleteLeaveType', () => {
      it('should prevent deletion when leave type is referenced by requests', async () => {
        leaveTypeModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue({ _id: mockLeaveTypeId }),
        });

        leaveRequestModel.countDocuments.mockReturnValue({
          exec: jest.fn().mockResolvedValue(10), // 10 requests using this type
        });

        await expect(
          service.deleteLeaveType(mockLeaveTypeId.toString()),
        ).rejects.toThrow(BadRequestException);
      });

      it('should prevent deletion when leave type is referenced by policies', async () => {
        leaveTypeModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue({ _id: mockLeaveTypeId }),
        });

        leaveRequestModel.countDocuments.mockReturnValue({
          exec: jest.fn().mockResolvedValue(0),
        });

        leavePolicyModel.countDocuments.mockReturnValue({
          exec: jest.fn().mockResolvedValue(3), // 3 policies using this type
        });

        await expect(
          service.deleteLeaveType(mockLeaveTypeId.toString()),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });

  describe('Manager Delegation (REQ-023)', () => {
    describe('createDelegation', () => {
      it('should create delegation successfully', async () => {
        const delegationData = {
          delegateeId: new Types.ObjectId().toString(),
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-06-30'),
          reason: 'Vacation',
        };

        leaveDelegationModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(null), // No overlapping delegation
        });

        (leaveDelegationModel as jest.Mock).mockImplementation(() => ({
          _id: new Types.ObjectId(),
          ...delegationData,
          save: jest.fn().mockResolvedValue({
            _id: new Types.ObjectId(),
            ...delegationData,
          }),
        }));

        const result = await service.createDelegation(
          mockManagerId,
          delegationData,
        );

        expect(result).toBeDefined();
      });

      it('should reject overlapping delegations', async () => {
        const existingDelegation = {
          _id: new Types.ObjectId(),
          delegatorId: mockManagerId,
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-06-30'),
          isActive: true,
        };

        const newDelegation = {
          delegateeId: new Types.ObjectId().toString(),
          startDate: new Date('2024-06-15'),
          endDate: new Date('2024-07-15'),
        };

        leaveDelegationModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(existingDelegation),
        });

        await expect(
          service.createDelegation(mockManagerId, newDelegation),
        ).rejects.toThrow(BadRequestException);
      });

      it('should reject invalid date range', async () => {
        const invalidDelegation = {
          delegateeId: new Types.ObjectId().toString(),
          startDate: new Date('2024-06-30'),
          endDate: new Date('2024-06-01'), // End before start
        };

        await expect(
          service.createDelegation(mockManagerId, invalidDelegation),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('canApproveOnBehalf', () => {
      it('should return true when delegation is active', async () => {
        const activeDelegation = {
          _id: new Types.ObjectId(),
          delegatorId: mockManagerId,
          delegateeId: mockEmployeeId,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          isActive: true,
        };

        leaveDelegationModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(activeDelegation),
        });

        const result = await service.canApproveOnBehalf(
          mockEmployeeId,
          mockManagerId,
        );

        expect(result).toBe(true);
      });

      it('should return false when delegation is expired', async () => {
        leaveDelegationModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        });

        const result = await service.canApproveOnBehalf(
          mockEmployeeId,
          mockManagerId,
        );

        expect(result).toBe(false);
      });
    });
  });

  describe('Accrual & Unpaid Leave (REQ-042)', () => {
    describe('isOnUnpaidLeave', () => {
      it('should return true when employee is on unpaid leave', async () => {
        const unpaidLeaveType = {
          _id: mockLeaveTypeId,
          paid: false,
        };

        const unpaidLeaveRequest = {
          _id: new Types.ObjectId(),
          employeeId: mockEmployeeId,
          leaveTypeId: mockLeaveTypeId,
          status: LeaveStatus.APPROVED,
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-06-10'),
        };

        leaveTypeModel.find.mockReturnValue({
          exec: jest.fn().mockResolvedValue([unpaidLeaveType]),
        });

        leaveRequestModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(unpaidLeaveRequest),
        });

        const result = await service.isOnUnpaidLeave(
          mockEmployeeId,
          new Date('2024-06-05'),
          new Date('2024-06-08'),
        );

        expect(result).toBe(true);
      });

      it('should return false when employee is not on unpaid leave', async () => {
        leaveTypeModel.find.mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        });

        leaveRequestModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        });

        const result = await service.isOnUnpaidLeave(
          mockEmployeeId,
          new Date('2024-06-05'),
          new Date('2024-06-08'),
        );

        expect(result).toBe(false);
      });
    });

    describe('createAccrualRecord', () => {
      it('should skip accrual when employee is on unpaid leave', async () => {
        jest.spyOn(service, 'isOnUnpaidLeave').mockResolvedValue(true);

        (leaveAccrualModel as jest.Mock).mockImplementation(() => ({
          skipped: true,
          skipReason: 'Employee on unpaid leave during accrual period',
          save: jest.fn().mockResolvedValue({
            skipped: true,
            skipReason: 'Employee on unpaid leave during accrual period',
          }),
        }));

        const result = await service.createAccrualRecord(
          mockEmployeeId,
          mockLeaveTypeId,
          new Date(),
          5,
          new Date('2024-06-01'),
          new Date('2024-06-30'),
        );

        expect(result.skipped).toBe(true);
        expect(result.skipReason).toContain('unpaid leave');
      });

      it('should create accrual when employee is not on unpaid leave', async () => {
        jest.spyOn(service, 'isOnUnpaidLeave').mockResolvedValue(false);

        (leaveAccrualModel as jest.Mock).mockImplementation(() => ({
          skipped: false,
          accrualAmount: 5,
          save: jest.fn().mockResolvedValue({
            skipped: false,
            accrualAmount: 5,
          }),
        }));

        const result = await service.createAccrualRecord(
          mockEmployeeId,
          mockLeaveTypeId,
          new Date(),
          5,
          new Date('2024-06-01'),
          new Date('2024-06-30'),
        );

        expect(result.skipped).toBe(false);
        expect(result.accrualAmount).toBe(5);
      });
    });
  });

  describe('Reset-Date Policy (REQ-012)', () => {
    describe('createResetPolicy', () => {
      it('should create yearly reset policy', async () => {
        const policyData = {
          organizationId: new Types.ObjectId().toString(),
          leaveTypeId: mockLeaveTypeId.toString(),
          resetType: 'YEARLY' as const,
        };

        resetPolicyModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(null), // No existing policy
        });

        (resetPolicyModel as jest.Mock).mockImplementation(() => ({
          _id: new Types.ObjectId(),
          ...policyData,
          nextResetDate: new Date('2025-01-01'),
          save: jest.fn().mockResolvedValue({
            _id: new Types.ObjectId(),
            ...policyData,
            nextResetDate: new Date('2025-01-01'),
          }),
        }));

        const result = await service.createResetPolicy(policyData);

        expect(result.resetType).toBe('YEARLY');
        expect(result.nextResetDate).toBeDefined();
      });

      it('should create custom reset policy with specific date', async () => {
        const customDate = new Date('2024-04-01');
        const policyData = {
          organizationId: new Types.ObjectId().toString(),
          leaveTypeId: mockLeaveTypeId.toString(),
          resetType: 'CUSTOM' as const,
          customResetDate: customDate,
        };

        resetPolicyModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        });

        (resetPolicyModel as jest.Mock).mockImplementation(() => ({
          _id: new Types.ObjectId(),
          ...policyData,
          nextResetDate: new Date('2025-04-01'),
          save: jest.fn().mockResolvedValue({
            _id: new Types.ObjectId(),
            ...policyData,
            nextResetDate: new Date('2025-04-01'),
          }),
        }));

        const result = await service.createResetPolicy(policyData);

        expect(result.resetType).toBe('CUSTOM');
        expect(result.customResetDate).toEqual(customDate);
      });
    });
  });

  describe('Audit Logging', () => {
    it('should create audit log when updating leave request', async () => {
      const mockRequest = {
        _id: mockRequestId,
        status: LeaveStatus.PENDING,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-05'),
        durationDays: 5,
        justification: 'Old',
        leaveTypeId: mockLeaveTypeId,
        save: jest.fn().mockResolvedValue(true),
      };

      leaveRequestModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRequest),
      });

      // Create a spy to track audit log creation and save
      const auditLogSaveSpy = jest.fn().mockResolvedValue({
        _id: new Types.ObjectId(),
        action: 'UPDATE',
        performedBy: mockEmployeeId,
      });
      (leaveAuditLogModel as jest.Mock).mockImplementation(() => ({
        _id: new Types.ObjectId(),
        action: 'UPDATE',
        performedBy: mockEmployeeId,
        save: auditLogSaveSpy,
      }));

      await service.updatePendingLeaveRequest(
        mockRequestId.toString(),
        { justification: 'New' },
        mockEmployeeId,
      );

      // Verify audit log constructor was called and save was invoked
      expect((leaveAuditLogModel as jest.Mock)).toHaveBeenCalled();
      expect(auditLogSaveSpy).toHaveBeenCalled();
    });

    it('should retrieve audit logs for a leave request', async () => {
      const mockLogs = [
        {
          _id: new Types.ObjectId(),
          action: 'CREATE',
          performedBy: mockEmployeeId,
          createdAt: new Date(),
        },
        {
          _id: new Types.ObjectId(),
          action: 'UPDATE',
          performedBy: mockEmployeeId,
          createdAt: new Date(),
        },
      ];

      leaveAuditLogModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockLogs),
          }),
        }),
      });

      const result = await service.getAuditLogs(mockRequestId.toString());

      expect(result).toHaveLength(2);
      expect(leaveAuditLogModel.find).toHaveBeenCalledWith({
        leaveRequestId: mockRequestId,
      });
    });
  });
});
