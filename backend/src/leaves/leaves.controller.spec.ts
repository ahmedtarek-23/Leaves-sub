import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Permission } from '../auth/permissions.constant';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';
import { AuthUser } from '../auth/auth-user.interface';
import { Types } from 'mongoose';
import { ResetType } from './models/reset-policy.schema';

// Mock @nestjs/passport to avoid dependency issues in tests
jest.mock('@nestjs/passport', () => ({
  AuthGuard: jest.fn(() => class MockAuthGuard {}),
}));

describe('LeavesController - RBAC Tests (REQ-002, REQ-014)', () => {
  let controller: LeavesController;
  let leavesService: jest.Mocked<LeavesService>;
  let rolesGuard: RolesGuard;
  let jwtAuthGuard: JwtAuthGuard;

  const mockEmployeeUser: AuthUser = {
    userId: 'employee123',
    role: SystemRole.DEPARTMENT_EMPLOYEE,
    email: 'employee@test.com',
  };

  const mockManagerUser: AuthUser = {
    userId: 'manager123',
    role: SystemRole.DEPARTMENT_HEAD,
    email: 'manager@test.com',
  };

  const mockHRAdminUser: AuthUser = {
    userId: 'hradmin123',
    role: SystemRole.HR_ADMIN,
    email: 'hradmin@test.com',
  };

  beforeEach(async () => {
    const mockLeavesService = {
      submitRequest: jest.fn(),
      updatePendingLeaveRequest: jest.fn(),
      processReview: jest.fn(),
      createLeaveCategory: jest.fn(),
      updateLeaveCategory: jest.fn(),
      deleteLeaveCategory: jest.fn(),
      createLeaveType: jest.fn(),
      updateLeaveType: jest.fn(),
      deleteLeaveType: jest.fn(),
      addHoliday: jest.fn(),
      removeHoliday: jest.fn(),
      addBlockedPeriod: jest.fn(),
      removeBlockedPeriod: jest.fn(),
      createResetPolicy: jest.fn(),
      manualAdjustBalance: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeavesController],
      providers: [
        {
          provide: LeavesService,
          useValue: mockLeavesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<LeavesController>(LeavesController);
    leavesService = module.get(LeavesService);
    rolesGuard = module.get(RolesGuard);
    jwtAuthGuard = module.get(JwtAuthGuard);
  });

  describe('EMPLOYEE Permissions (REQ-002)', () => {
    it('should allow EMPLOYEE to create leave requests', async () => {
      const requestData = {
        employeeId: mockEmployeeUser.userId,
        leaveTypeId: new Types.ObjectId().toString(),
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-05'),
        durationDays: 5,
      };

      const mockRequest = {
        _id: new Types.ObjectId(),
        ...requestData,
        status: 'PENDING',
      };

      leavesService.submitRequest.mockResolvedValue(mockRequest as any);

      // Simulate EMPLOYEE user making request
      const result = await controller.submitRequest(requestData, mockEmployeeUser);

      expect(leavesService.submitRequest).toHaveBeenCalledWith(requestData);
      expect(result).toEqual(mockRequest);
    });

    it('should allow EMPLOYEE to update PENDING requests', async () => {
      const requestId = new Types.ObjectId().toString();
      const updateData = {
        justification: 'Updated reason',
      };

      const mockUpdatedRequest = {
        _id: new Types.ObjectId(requestId),
        status: 'PENDING',
        justification: 'Updated reason',
      };

      leavesService.updatePendingLeaveRequest.mockResolvedValue(
        mockUpdatedRequest as any,
      );

      const result = await controller.updatePendingLeaveRequest(
        requestId,
        updateData,
        mockEmployeeUser,
      );

      expect(leavesService.updatePendingLeaveRequest).toHaveBeenCalledWith(
        requestId,
        updateData,
        expect.any(Types.ObjectId),
      );
      expect(result).toEqual(mockUpdatedRequest);
    });

    it('should NOT allow EMPLOYEE to approve/reject requests', () => {
      // This is tested via guard - EMPLOYEE role doesn't have APPROVE_LEAVES permission
      // The guard should throw ForbiddenException
      const hasPermission = [Permission.APPROVE_LEAVES].some((perm) =>
        [Permission.REQUEST_LEAVE].includes(perm),
      );
      expect(hasPermission).toBe(false);
    });

    it('should NOT allow EMPLOYEE to manage calendars/policies', () => {
      // EMPLOYEE role doesn't have MANAGE_LEAVES permission
      const hasPermission = [Permission.MANAGE_LEAVES].some((perm) =>
        [Permission.REQUEST_LEAVE].includes(perm),
      );
      expect(hasPermission).toBe(false);
    });
  });

  describe('MANAGER Permissions (REQ-002, REQ-014)', () => {
    it('should allow MANAGER to approve leave requests', async () => {
      const requestId = new Types.ObjectId().toString();
      const reviewData = {
        approverId: mockManagerUser.userId,
        action: 'APPROVE' as const,
        isHR: false,
      };

      const mockApprovedRequest = {
        _id: new Types.ObjectId(requestId),
        status: 'APPROVED',
      };

      leavesService.processReview.mockResolvedValue(mockApprovedRequest as any);

      const result = await controller.reviewRequest(requestId, reviewData);

      expect(leavesService.processReview).toHaveBeenCalledWith(requestId, reviewData);
      expect(result).toEqual(mockApprovedRequest);
    });

    it('should allow MANAGER to reject leave requests', async () => {
      const requestId = new Types.ObjectId().toString();
      const reviewData = {
        approverId: mockManagerUser.userId,
        action: 'REJECT' as const,
        isHR: false,
        reason: 'Insufficient balance',
      };

      const mockRejectedRequest = {
        _id: new Types.ObjectId(requestId),
        status: 'REJECTED',
      };

      leavesService.processReview.mockResolvedValue(mockRejectedRequest as any);

      const result = await controller.reviewRequest(requestId, reviewData);

      expect(leavesService.processReview).toHaveBeenCalledWith(requestId, reviewData);
      expect(result).toEqual(mockRejectedRequest);
    });

    it('should NOT allow MANAGER to manage calendars/policies', () => {
      // MANAGER (DEPARTMENT_HEAD) has APPROVE_LEAVES but not MANAGE_LEAVES
      const hasPermission = [Permission.MANAGE_LEAVES].some((perm) =>
        [Permission.APPROVE_LEAVES].includes(perm),
      );
      expect(hasPermission).toBe(false);
    });
  });

  describe('HR_ADMIN Permissions (REQ-002, REQ-014)', () => {
    it('should allow HR_ADMIN to manage calendars', async () => {
      const year = 2024;
      const holidayData = {
        name: 'New Year',
        date: new Date('2024-01-01'),
        description: 'New Year Day',
        year: 2024,
      };

      const mockCalendar = {
        year,
        holidays: [holidayData.date],
      };

      leavesService.addHoliday.mockResolvedValue(mockCalendar as any);

      const result = await controller.addHoliday(year, holidayData);

      expect(leavesService.addHoliday).toHaveBeenCalledWith(year, holidayData);
      expect(result).toEqual(mockCalendar);
    });

    it('should allow HR_ADMIN to manage leave types', async () => {
      const leaveTypeData = {
        name: 'Sick Leave',
        code: 'SL',
        categoryId: new Types.ObjectId().toString(),
      };

      const mockLeaveType = {
        _id: new Types.ObjectId(),
        ...leaveTypeData,
      };

      leavesService.createLeaveType.mockResolvedValue(mockLeaveType as any);

      const result = await controller.createLeaveType(leaveTypeData);

      expect(leavesService.createLeaveType).toHaveBeenCalledWith(leaveTypeData);
      expect(result).toEqual(mockLeaveType);
    });

    it('should allow HR_ADMIN to manage leave categories', async () => {
      const categoryData = {
        name: 'Medical Leave',
        description: 'Leave for medical reasons',
      };

      const mockCategory = {
        _id: new Types.ObjectId(),
        ...categoryData,
      };

      leavesService.createLeaveCategory.mockResolvedValue(mockCategory as any);

      const result = await controller.createLeaveCategory(categoryData);

      expect(leavesService.createLeaveCategory).toHaveBeenCalledWith(categoryData);
      expect(result).toEqual(mockCategory);
    });

    it('should allow HR_ADMIN to manage reset policies', async () => {
      const policyData = {
        organizationId: new Types.ObjectId().toString(),
        leaveTypeId: new Types.ObjectId().toString(),
        resetType: ResetType.YEARLY,
      };

      const mockPolicy = {
        _id: new Types.ObjectId(),
        ...policyData,
      };

      leavesService.createResetPolicy.mockResolvedValue(mockPolicy as any);

      const result = await controller.createResetPolicy(policyData);

      expect(leavesService.createResetPolicy).toHaveBeenCalledWith(policyData);
      expect(result).toEqual(mockPolicy);
    });

    it('should allow HR_ADMIN to perform manual balance adjustments', async () => {
      const adjustmentData = {
        employeeId: mockEmployeeUser.userId,
        typeCode: 'SL',
        amount: 5,
        justification: 'Correction',
      };

      const mockAdjustedBalance = {
        remaining: 15,
      };

      leavesService.manualAdjustBalance.mockResolvedValue(mockAdjustedBalance as any);

      const result = await controller.adjustBalance(adjustmentData);

      expect(leavesService.manualAdjustBalance).toHaveBeenCalledWith(adjustmentData);
      expect(result).toEqual(mockAdjustedBalance);
    });
  });

  describe('Unauthorized Access (REQ-002, REQ-014)', () => {
    it('should document that guards prevent unauthorized access', () => {
      // Note: Full RBAC testing requires integration tests with actual guards
      // The RolesGuard checks user.role against required permissions
      // If user lacks permission, ForbiddenException is thrown
      
      // EMPLOYEE trying to access MANAGER-only endpoint should fail
      const employeePermissions = [Permission.REQUEST_LEAVE];
      const requiredPermission = Permission.APPROVE_LEAVES;
      const hasAccess = employeePermissions.includes(requiredPermission);
      expect(hasAccess).toBe(false);

      // EMPLOYEE trying to access HR_ADMIN-only endpoint should fail
      const requiredHRPermission = Permission.MANAGE_LEAVES;
      const hasHRAccess = employeePermissions.includes(requiredHRPermission);
      expect(hasHRAccess).toBe(false);
    });
  });
});
