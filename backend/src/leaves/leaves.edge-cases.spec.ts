import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { LeaveStatus } from './enums/leave-status.enum';
import { Types } from 'mongoose';

describe('LeavesService - Edge Cases', () => {
  let service: LeavesService;
  let leaveRequestModel: any;
  let calendarModel: any;
  let leaveDelegationModel: any;
  let leaveTypeModel: any;
  let leaveCategoryModel: any;

  const mockEmployeeId = new Types.ObjectId();
  const mockManagerId = new Types.ObjectId();

  beforeEach(async () => {
    const mockModels = {
      find: jest.fn().mockReturnValue({ exec: jest.fn(), populate: jest.fn() }),
      findOne: jest.fn().mockReturnValue({ exec: jest.fn(), populate: jest.fn() }),
      findById: jest.fn().mockReturnValue({ exec: jest.fn(), populate: jest.fn() }),
      findByIdAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn() }),
      findByIdAndDelete: jest.fn().mockReturnValue({ exec: jest.fn() }),
      countDocuments: jest.fn().mockReturnValue({ exec: jest.fn() }),
      create: jest.fn(),
      save: jest.fn(),
      new: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeavesService,
        { provide: getModelToken('LeaveRequest'), useValue: mockModels },
        { provide: getModelToken('LeaveType'), useValue: mockModels },
        { provide: getModelToken('LeaveCategory'), useValue: mockModels },
        { provide: getModelToken('LeavePolicy'), useValue: mockModels },
        { provide: getModelToken('LeaveEntitlement'), useValue: mockModels },
        { provide: getModelToken('LeaveAdjustment'), useValue: mockModels },
        { provide: getModelToken('Calendar'), useValue: mockModels },
        { provide: getModelToken('Attachment'), useValue: mockModels },
        { provide: getModelToken('LeaveDelegation'), useValue: mockModels },
        { provide: getModelToken('LeaveAuditLog'), useValue: mockModels },
        { provide: getModelToken('LeaveNotification'), useValue: mockModels },
        { provide: getModelToken('LeaveAccrual'), useValue: mockModels },
        { provide: getModelToken('LeaveBalance'), useValue: mockModels },
        { provide: getModelToken('ResetPolicy'), useValue: mockModels },
        { provide: 'NotificationService', useValue: {
          notifyRequestSubmitted: jest.fn(),
          notifyRequestApproved: jest.fn(),
          notifyRequestRejected: jest.fn(),
        } },
        { provide: 'TimeManagementService', useValue: {} },
        { provide: 'EmployeeProfileService', useValue: {} },
        { provide: 'PayrollExecutionService', useValue: {} },
      ],
    }).compile();

    service = module.get<LeavesService>(LeavesService);
    leaveRequestModel = module.get(getModelToken('LeaveRequest'));
    calendarModel = module.get(getModelToken('Calendar'));
    leaveDelegationModel = module.get(getModelToken('LeaveDelegation'));
    leaveTypeModel = module.get(getModelToken('LeaveType'));
    leaveCategoryModel = module.get(getModelToken('LeaveCategory'));
  });

  describe('Edge Cases - Calendar Management', () => {
    it('should handle calendar not existing when adding blocked period', async () => {
      const year = 2024;
      const blockedPeriod = {
        from: new Date('2024-12-20'),
        to: new Date('2024-12-31'),
        reason: 'Year-end',
      };

      calendarModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null), // Calendar doesn't exist
      });

      calendarModel.prototype.save = jest.fn().mockResolvedValue({
        year,
        blockedPeriods: [blockedPeriod],
      });
      calendarModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({
          year,
          blockedPeriods: [blockedPeriod],
        }),
      }));

      const result = await service.addBlockedPeriod(year, blockedPeriod);

      expect(result.blockedPeriods).toContainEqual(blockedPeriod);
    });

    it('should handle partial overlap detection correctly', async () => {
      const year = 2024;
      const existingPeriod = {
        from: new Date('2024-12-20'),
        to: new Date('2024-12-31'),
        reason: 'Existing',
      };

      // New period starts before but ends during existing period
      const overlappingPeriod = {
        from: new Date('2024-12-15'),
        to: new Date('2024-12-25'),
        reason: 'Overlapping',
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
        service.addBlockedPeriod(year, overlappingPeriod),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Edge Cases - Delegation', () => {
    it('should handle delegation with same start and end date', async () => {
      const delegationData = {
        delegateeId: new Types.ObjectId().toString(),
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-01'), // Same date
        reason: 'Single day',
      };

      await expect(
        service.createDelegation(mockManagerId, delegationData),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle delegation that ends exactly when another starts', async () => {
      const existingDelegation = {
        _id: new Types.ObjectId(),
        delegatorId: mockManagerId,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-30'),
        isActive: true,
      };

      const newDelegation = {
        delegateeId: new Types.ObjectId().toString(),
        startDate: new Date('2024-07-01'), // Starts exactly when previous ends
        endDate: new Date('2024-07-31'),
      };

      leaveDelegationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null), // No overlap
      });

      leaveDelegationModel.prototype.save = jest.fn().mockResolvedValue({
        _id: new Types.ObjectId(),
        ...newDelegation,
      });
      leaveDelegationModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(),
          ...newDelegation,
        }),
      }));

      const result = await service.createDelegation(mockManagerId, newDelegation);

      expect(result).toBeDefined();
    });
  });

  describe('Edge Cases - Leave Type & Category', () => {
    it('should handle deletion of category with zero references', async () => {
      leaveCategoryModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
      });

      leaveTypeModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      leaveCategoryModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      await expect(
        service.deleteLeaveCategory(new Types.ObjectId().toString()),
      ).resolves.not.toThrow();
    });

    it('should handle updating category name to existing name (same category)', async () => {
      const categoryId = new Types.ObjectId();
      const category = {
        _id: categoryId,
        name: 'Existing Category',
      };

      leaveCategoryModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(category),
      });

      category.save = jest.fn().mockResolvedValue(category);

      const result = await service.updateLeaveCategory(
        categoryId.toString(),
        { name: 'Existing Category' }, // Same name
      );

      expect(result).toBeDefined();
    });
  });

  describe('Edge Cases - Leave Request Updates', () => {
    it('should handle updating only dates without other fields', async () => {
      const mockRequest = {
        _id: new Types.ObjectId(),
        status: LeaveStatus.PENDING,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-05'),
        durationDays: 5,
        justification: 'Original',
        leaveTypeId: new Types.ObjectId(),
        save: jest.fn().mockResolvedValue(true),
      };

      leaveRequestModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRequest),
      });

      leaveAuditLogModel.prototype.save = jest.fn().mockResolvedValue({});
      leaveAuditLogModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({}),
      }));

      const result = await service.updatePendingLeaveRequest(
        mockRequest._id.toString(),
        {
          startDate: new Date('2024-07-01'),
          endDate: new Date('2024-07-10'),
        },
        mockEmployeeId,
      );

      expect(mockRequest.save).toHaveBeenCalled();
      // Duration should be recalculated
      expect(mockRequest.durationDays).toBeGreaterThan(5);
    });

    it('should handle updating request that does not exist', async () => {
      leaveRequestModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updatePendingLeaveRequest(
          new Types.ObjectId().toString(),
          { justification: 'New' },
          mockEmployeeId,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Edge Cases - Accrual', () => {
    it('should handle accrual when no unpaid leave types exist', async () => {
      leaveTypeModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]), // No unpaid leave types
      });

      leaveRequestModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.isOnUnpaidLeave(
        mockEmployeeId,
        new Date('2024-06-01'),
        new Date('2024-06-30'),
      );

      expect(result).toBe(false);
    });

    it('should handle accrual period that spans multiple unpaid leave periods', async () => {
      const unpaidLeaveType = {
        _id: new Types.ObjectId(),
        paid: false,
      };

      const unpaidLeave1 = {
        _id: new Types.ObjectId(),
        employeeId: mockEmployeeId,
        leaveTypeId: unpaidLeaveType._id,
        status: LeaveStatus.APPROVED,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-10'),
      };

      leaveTypeModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([unpaidLeaveType]),
      });

      leaveRequestModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(unpaidLeave1),
      });

      const result = await service.isOnUnpaidLeave(
        mockEmployeeId,
        new Date('2024-06-05'), // During unpaid leave
        new Date('2024-06-15'),
      );

      expect(result).toBe(true);
    });
  });

  describe('Edge Cases - Reset Policy', () => {
    it('should handle custom reset date in the past', async () => {
      const policyData = {
        organizationId: new Types.ObjectId().toString(),
        leaveTypeId: new Types.ObjectId().toString(),
        resetType: 'CUSTOM' as const,
        customResetDate: new Date('2024-04-01'), // Past date
      };

      resetPolicyModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      resetPolicyModel.prototype.save = jest.fn().mockResolvedValue({
        _id: new Types.ObjectId(),
        ...policyData,
        nextResetDate: new Date('2025-04-01'), // Should be next year
      });
      resetPolicyModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(),
          ...policyData,
          nextResetDate: new Date('2025-04-01'),
        }),
      }));

      const result = await service.createResetPolicy(policyData);

      expect(result.nextResetDate.getFullYear()).toBe(2025);
    });

    it('should handle updating existing reset policy', async () => {
      const existingPolicy = {
        _id: new Types.ObjectId(),
        organizationId: new Types.ObjectId(),
        leaveTypeId: new Types.ObjectId(),
        resetType: 'YEARLY',
        isActive: true,
        save: jest.fn().mockResolvedValue(true),
      };

      const policyData = {
        organizationId: existingPolicy.organizationId.toString(),
        leaveTypeId: existingPolicy.leaveTypeId.toString(),
        resetType: 'CUSTOM' as const,
        customResetDate: new Date('2024-04-01'),
      };

      resetPolicyModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingPolicy),
      });

      const result = await service.createResetPolicy(policyData);

      expect(existingPolicy.save).toHaveBeenCalled();
      expect(existingPolicy.resetType).toBe('CUSTOM');
    });
  });
});
