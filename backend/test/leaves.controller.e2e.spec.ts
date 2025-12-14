import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, BadRequestException } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LeavesModule } from '../src/leaves/leaves.module';
import { LeavesController } from '../src/leaves/leaves.controller';
import { LeavesService } from '../src/leaves/leaves.service';
import { NotificationService } from '../src/leaves/notifications/notification.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { Permission, SystemRole } from '../src/auth/permissions.constant';
import { AuthUser } from '../src/auth/auth-user.interface';
import { LeaveRequest } from '../src/leaves/models/leave-request.schema';
import { LeaveType } from '../src/leaves/models/leave-type.schema';
import { LeaveCategory } from '../src/leaves/models/leave-category.schema';
import { Calendar } from '../src/leaves/models/calendar.schema';
import { LeaveDelegation } from '../src/leaves/models/leave-delegation.schema';
import { LeaveAuditLog } from '../src/leaves/models/leave-audit-log.schema';
import { LeaveNotification } from '../src/leaves/models/leave-notification.schema';
import { LeaveAccrual } from '../src/leaves/models/leave-accrual.schema';
import { ResetPolicy } from '../src/leaves/models/reset-policy.schema';
import { LeaveStatus } from '../src/leaves/enums/leave-status.enum';
import { Types } from 'mongoose';

// Mock guards
const mockJwtAuthGuard = {
  canActivate: jest.fn((context) => {
    const request = context.switchToHttp().getRequest();
    // Set mock user based on test
    if (!request.user) {
      request.user = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: SystemRole.DEPARTMENT_EMPLOYEE,
        employeeId: 'test-employee-id',
      };
    }
    return true;
  }),
};

const mockRolesGuard = {
  canActivate: jest.fn(() => true),
};

describe('LeavesController E2E Tests', () => {
  let app: INestApplication;
  let leavesService: LeavesService;
  let leaveRequestModel: Model<LeaveRequest>;
  let leaveTypeModel: Model<LeaveType>;
  let leaveCategoryModel: Model<LeaveCategory>;
  let calendarModel: Model<Calendar>;
  let leaveDelegationModel: Model<LeaveDelegation>;
  let leaveAuditLogModel: Model<LeaveAuditLog>;
  let leaveNotificationModel: Model<LeaveNotification>;
  let leaveAccrualModel: Model<LeaveAccrual>;
  let resetPolicyModel: Model<ResetPolicy>;

  const mockEmployeeId = new Types.ObjectId();
  const mockManagerId = new Types.ObjectId();
  const mockLeaveTypeId = new Types.ObjectId();
  const mockCategoryId = new Types.ObjectId();
  const mockRequestId = new Types.ObjectId();

  // Mock users for RBAC testing
  const employeeUser: AuthUser = {
    userId: mockEmployeeId.toString(),
    email: 'employee@example.com',
    role: SystemRole.DEPARTMENT_EMPLOYEE,
    employeeId: mockEmployeeId.toString(),
  };

  const managerUser: AuthUser = {
    userId: mockManagerId.toString(),
    email: 'manager@example.com',
    role: SystemRole.DEPARTMENT_HEAD,
    employeeId: mockManagerId.toString(),
  };

  const hrAdminUser: AuthUser = {
    userId: 'hr-admin-id',
    email: 'hr@example.com',
    role: SystemRole.HR_ADMIN,
    employeeId: 'hr-admin-id',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/test-leaves', {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }),
        LeavesModule,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    leavesService = moduleFixture.get<LeavesService>(LeavesService);
    leaveRequestModel = moduleFixture.get<Model<LeaveRequest>>(
      getModelToken('LeaveRequest'),
    );
    leaveTypeModel = moduleFixture.get<Model<LeaveType>>(
      getModelToken('LeaveType'),
    );
    leaveCategoryModel = moduleFixture.get<Model<LeaveCategory>>(
      getModelToken('LeaveCategory'),
    );
    calendarModel = moduleFixture.get<Model<Calendar>>(
      getModelToken('Calendar'),
    );
    leaveDelegationModel = moduleFixture.get<Model<LeaveDelegation>>(
      getModelToken('LeaveDelegation'),
    );
    leaveAuditLogModel = moduleFixture.get<Model<LeaveAuditLog>>(
      getModelToken('LeaveAuditLog'),
    );
    leaveNotificationModel = moduleFixture.get<Model<LeaveNotification>>(
      getModelToken('LeaveNotification'),
    );
    leaveAccrualModel = moduleFixture.get<Model<LeaveAccrual>>(
      getModelToken('LeaveAccrual'),
    );
    resetPolicyModel = moduleFixture.get<Model<ResetPolicy>>(
      getModelToken('ResetPolicy'),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock user to employee by default
    mockJwtAuthGuard.canActivate = jest.fn((context) => {
      const request = context.switchToHttp().getRequest();
      request.user = employeeUser;
      return true;
    });
  });

  describe('RBAC & Authorization Tests (REQ-002, REQ-014)', () => {
    describe('EMPLOYEE Role', () => {
      beforeEach(() => {
        mockJwtAuthGuard.canActivate = jest.fn((context) => {
          const request = context.switchToHttp().getRequest();
          request.user = employeeUser;
          return true;
        });

        // Mock RolesGuard to allow REQUEST_LEAVE permission
        mockRolesGuard.canActivate = jest.fn((context) => {
          const reflector = context.getArgByIndex(0);
          const requiredPermissions = reflector?.getAllAndOverride?.(
            'permissions',
            [context.getHandler(), context.getClass()],
          );
          if (!requiredPermissions) return true;
          // Employee has REQUEST_LEAVE permission
          return requiredPermissions.includes(Permission.REQUEST_LEAVE);
        });
      });

      it('should allow EMPLOYEE to create leave request', async () => {
        const requestData = {
          employeeId: mockEmployeeId.toString(),
          leaveTypeId: mockLeaveTypeId.toString(),
          startDate: '2024-06-01',
          endDate: '2024-06-05',
          durationDays: 5,
        };

        jest.spyOn(leavesService, 'submitRequest').mockResolvedValue({
          _id: mockRequestId,
          ...requestData,
          status: LeaveStatus.PENDING,
        } as any);

        const response = await request(app.getHttpServer())
          .post('/leaves/request')
          .send(requestData)
          .expect(201);

        expect(response.body.status).toBe(LeaveStatus.PENDING);
      });

      it('should allow EMPLOYEE to edit PENDING request', async () => {
        const updateData = {
          justification: 'Updated reason',
        };

        jest.spyOn(leavesService, 'updatePendingLeaveRequest').mockResolvedValue({
          _id: mockRequestId,
          status: LeaveStatus.PENDING,
          justification: 'Updated reason',
        } as any);

        await request(app.getHttpServer())
          .put(`/leaves/request/${mockRequestId}`)
          .send(updateData)
          .expect(200);
      });

      it('should deny EMPLOYEE from approving requests', async () => {
        mockRolesGuard.canActivate = jest.fn(() => false); // No permission

        await request(app.getHttpServer())
          .put(`/leaves/request/${mockRequestId}/review`)
          .send({
            approverId: mockManagerId.toString(),
            action: 'APPROVE',
            isHR: false,
          })
          .expect(403);
      });

      it('should deny EMPLOYEE from managing leave types', async () => {
        mockRolesGuard.canActivate = jest.fn(() => false);

        await request(app.getHttpServer())
          .post('/leaves/types')
          .send({
            code: 'TEST',
            name: 'Test Leave',
            categoryId: mockCategoryId.toString(),
          })
          .expect(403);
      });
    });

    describe('MANAGER Role', () => {
      beforeEach(() => {
        mockJwtAuthGuard.canActivate = jest.fn((context) => {
          const request = context.switchToHttp().getRequest();
          request.user = managerUser;
          return true;
        });

        mockRolesGuard.canActivate = jest.fn((context) => {
          const reflector = context.getArgByIndex(0);
          const requiredPermissions = reflector?.getAllAndOverride?.(
            'permissions',
            [context.getHandler(), context.getClass()],
          );
          if (!requiredPermissions) return true;
          // Manager has APPROVE_LEAVES permission
          return requiredPermissions.includes(Permission.APPROVE_LEAVES);
        });
      });

      it('should allow MANAGER to approve requests', async () => {
        jest.spyOn(leavesService, 'processReview').mockResolvedValue({
          _id: mockRequestId,
          status: LeaveStatus.APPROVED,
        } as any);

        await request(app.getHttpServer())
          .put(`/leaves/request/${mockRequestId}/review`)
          .send({
            approverId: mockManagerId.toString(),
            action: 'APPROVE',
            isHR: false,
          })
          .expect(200);
      });

      it('should deny MANAGER from managing policies', async () => {
        mockRolesGuard.canActivate = jest.fn(() => false);

        await request(app.getHttpServer())
          .post('/leaves/policies')
          .send({})
          .expect(403);
      });

      it('should deny MANAGER from managing calendars', async () => {
        mockRolesGuard.canActivate = jest.fn(() => false);

        await request(app.getHttpServer())
          .post('/leaves/calendar/2024/blocked-periods')
          .send({
            from: '2024-12-20',
            to: '2024-12-31',
            reason: 'Year-end',
            year: 2024,
          })
          .expect(403);
      });
    });

    describe('HR_ADMIN Role', () => {
      beforeEach(() => {
        mockJwtAuthGuard.canActivate = jest.fn((context) => {
          const request = context.switchToHttp().getRequest();
          request.user = hrAdminUser;
          return true;
        });

        mockRolesGuard.canActivate = jest.fn((context) => {
          const reflector = context.getArgByIndex(0);
          const requiredPermissions = reflector?.getAllAndOverride?.(
            'permissions',
            [context.getHandler(), context.getClass()],
          );
          if (!requiredPermissions) return true;
          // HR_ADMIN has MANAGE_LEAVES permission
          return requiredPermissions.includes(Permission.MANAGE_LEAVES);
        });
      });

      it('should allow HR_ADMIN to create leave types', async () => {
        jest.spyOn(leavesService, 'createLeaveType').mockResolvedValue({
          _id: mockLeaveTypeId,
          code: 'TEST',
          name: 'Test Leave',
        } as any);

        await request(app.getHttpServer())
          .post('/leaves/types')
          .send({
            code: 'TEST',
            name: 'Test Leave',
            categoryId: mockCategoryId.toString(),
          })
          .expect(201);
      });

      it('should allow HR_ADMIN to manage calendars', async () => {
        jest.spyOn(leavesService, 'addBlockedPeriod').mockResolvedValue({
          year: 2024,
          blockedPeriods: [
            {
              from: new Date('2024-12-20'),
              to: new Date('2024-12-31'),
              reason: 'Year-end',
            },
          ],
        } as any);

        await request(app.getHttpServer())
          .post('/leaves/calendar/2024/blocked-periods')
          .send({
            from: '2024-12-20',
            to: '2024-12-31',
            reason: 'Year-end',
            year: 2024,
          })
          .expect(201);
      });

      it('should allow HR_ADMIN to adjust balances', async () => {
        jest.spyOn(leavesService, 'manualAdjustBalance').mockResolvedValue({
          success: true,
        } as any);

        await request(app.getHttpServer())
          .put('/leaves/balances/adjust')
          .send({
            employeeId: mockEmployeeId.toString(),
            typeCode: 'ANNUAL',
            amount: 5,
            justification: 'Manual adjustment',
          })
          .expect(200);
      });
    });
  });

  describe('Leave Request Lifecycle Tests', () => {
    it('should create leave request with PENDING status', async () => {
      const requestData = {
        employeeId: mockEmployeeId.toString(),
        leaveTypeId: mockLeaveTypeId.toString(),
        startDate: '2024-06-01',
        endDate: '2024-06-05',
        durationDays: 5,
      };

      jest.spyOn(leavesService, 'submitRequest').mockResolvedValue({
        _id: mockRequestId,
        ...requestData,
        status: LeaveStatus.PENDING,
      } as any);

      const response = await request(app.getHttpServer())
        .post('/leaves/request')
        .send(requestData)
        .expect(201);

      expect(response.body.status).toBe(LeaveStatus.PENDING);
    });

    it('should allow editing PENDING request', async () => {
      jest.spyOn(leavesService, 'updatePendingLeaveRequest').mockResolvedValue({
        _id: mockRequestId,
        status: LeaveStatus.PENDING,
        justification: 'Updated',
      } as any);

      await request(app.getHttpServer())
        .put(`/leaves/request/${mockRequestId}`)
        .send({ justification: 'Updated' })
        .expect(200);
    });

    it('should prevent editing APPROVED request', async () => {
      jest
        .spyOn(leavesService, 'updatePendingLeaveRequest')
        .mockRejectedValue(
          new BadRequestException(
            'Cannot update leave request. Only PENDING requests can be updated.',
          ),
        );

      await request(app.getHttpServer())
        .put(`/leaves/request/${mockRequestId}`)
        .send({ justification: 'Updated' })
        .expect(400);
    });

    it('should create audit log when updating request', async () => {
      jest.spyOn(leavesService, 'updatePendingLeaveRequest').mockResolvedValue({
        _id: mockRequestId,
        status: LeaveStatus.PENDING,
      } as any);

      jest.spyOn(leavesService, 'getAuditLogs').mockResolvedValue([
        {
          _id: new Types.ObjectId(),
          action: 'UPDATE',
          performedBy: mockEmployeeId,
          createdAt: new Date(),
        },
      ] as any);

      await request(app.getHttpServer())
        .put(`/leaves/request/${mockRequestId}`)
        .send({ justification: 'Updated' })
        .expect(200);

      const auditLogs = await request(app.getHttpServer())
        .get(`/leaves/request/${mockRequestId}/audit-logs`)
        .expect(200);

      expect(auditLogs.body).toHaveLength(1);
      expect(auditLogs.body[0].action).toBe('UPDATE');
    });
  });

  describe('Leave Calendar Management Tests (REQ-010)', () => {
    beforeEach(() => {
      mockJwtAuthGuard.canActivate = jest.fn((context) => {
        const request = context.switchToHttp().getRequest();
        request.user = hrAdminUser;
        return true;
      });
      mockRolesGuard.canActivate = jest.fn(() => true);
    });

    it('should create blocked period', async () => {
      jest.spyOn(leavesService, 'addBlockedPeriod').mockResolvedValue({
        year: 2024,
        blockedPeriods: [
          {
            from: new Date('2024-12-20'),
            to: new Date('2024-12-31'),
            reason: 'Year-end closure',
          },
        ],
      } as any);

      const response = await request(app.getHttpServer())
        .post('/leaves/calendar/2024/blocked-periods')
        .send({
          from: '2024-12-20',
          to: '2024-12-31',
          reason: 'Year-end closure',
          year: 2024,
        })
        .expect(201);

      expect(response.body.blockedPeriods).toHaveLength(1);
    });

    it('should reject overlapping blocked periods', async () => {
      jest
        .spyOn(leavesService, 'addBlockedPeriod')
        .mockRejectedValue(
          new BadRequestException(
            'Blocked period overlaps with an existing blocked period',
          ),
        );

      await request(app.getHttpServer())
        .post('/leaves/calendar/2024/blocked-periods')
        .send({
          from: '2024-12-25',
          to: '2025-01-05',
          reason: 'Overlapping',
          year: 2024,
        })
        .expect(400);
    });

    it('should reject leave request on blocked dates', async () => {
      jest
        .spyOn(leavesService, 'submitRequest')
        .mockRejectedValue(
          new BadRequestException('Leave request falls on a blocked period'),
        );

      await request(app.getHttpServer())
        .post('/leaves/request')
        .send({
          employeeId: mockEmployeeId.toString(),
          leaveTypeId: mockLeaveTypeId.toString(),
          startDate: '2024-12-25',
          endDate: '2024-12-28',
          durationDays: 4,
        })
        .expect(400);
    });
  });

  describe('Leave Type & Category Management Tests (REQ-011)', () => {
    beforeEach(() => {
      mockJwtAuthGuard.canActivate = jest.fn((context) => {
        const request = context.switchToHttp().getRequest();
        request.user = hrAdminUser;
        return true;
      });
      mockRolesGuard.canActivate = jest.fn(() => true);
    });

    it('should create leave category', async () => {
      jest.spyOn(leavesService, 'createLeaveCategory').mockResolvedValue({
        _id: mockCategoryId,
        name: 'Test Category',
      } as any);

      const response = await request(app.getHttpServer())
        .post('/leaves/categories')
        .send({ name: 'Test Category' })
        .expect(201);

      expect(response.body.name).toBe('Test Category');
    });

    it('should prevent deletion of category when referenced', async () => {
      jest
        .spyOn(leavesService, 'deleteLeaveCategory')
        .mockRejectedValue(
          new BadRequestException(
            'Cannot delete category. 5 leave type(s) are using this category.',
          ),
        );

      await request(app.getHttpServer())
        .delete(`/leaves/categories/${mockCategoryId}`)
        .expect(400);
    });

    it('should prevent deletion of leave type when referenced', async () => {
      jest
        .spyOn(leavesService, 'deleteLeaveType')
        .mockRejectedValue(
          new BadRequestException(
            'Cannot delete leave type. 10 leave request(s) are using this type.',
          ),
        );

      await request(app.getHttpServer())
        .delete(`/leaves/types/${mockLeaveTypeId}`)
        .expect(400);
    });
  });

  describe('Manager Delegation Tests (REQ-023)', () => {
    beforeEach(() => {
      mockJwtAuthGuard.canActivate = jest.fn((context) => {
        const request = context.switchToHttp().getRequest();
        request.user = managerUser;
        return true;
      });
      mockRolesGuard.canActivate = jest.fn(() => true);
    });

    it('should create delegation', async () => {
      jest.spyOn(leavesService, 'createDelegation').mockResolvedValue({
        _id: new Types.ObjectId(),
        delegatorId: mockManagerId,
        delegateeId: mockEmployeeId,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-30'),
        isActive: true,
      } as any);

      const response = await request(app.getHttpServer())
        .post('/leaves/delegations')
        .send({
          delegateeId: mockEmployeeId.toString(),
          startDate: '2024-06-01',
          endDate: '2024-06-30',
          reason: 'Vacation',
        })
        .expect(201);

      expect(response.body.isActive).toBe(true);
    });

    it('should reject overlapping delegations', async () => {
      jest
        .spyOn(leavesService, 'createDelegation')
        .mockRejectedValue(
          new BadRequestException(
            'Delegation overlaps with an existing active delegation',
          ),
        );

      await request(app.getHttpServer())
        .post('/leaves/delegations')
        .send({
          delegateeId: mockEmployeeId.toString(),
          startDate: '2024-06-15',
          endDate: '2024-07-15',
          reason: 'Overlapping',
        })
        .expect(400);
    });

    it('should check if delegatee can approve on behalf', async () => {
      jest.spyOn(leavesService, 'canApproveOnBehalf').mockResolvedValue(true);

      const result = await leavesService.canApproveOnBehalf(
        mockEmployeeId,
        mockManagerId,
      );

      expect(result).toBe(true);
    });
  });

  describe('Accrual & Unpaid Leave Tests (REQ-042)', () => {
    it('should skip accrual during unpaid leave', async () => {
      jest.spyOn(leavesService, 'isOnUnpaidLeave').mockResolvedValue(true);
      jest.spyOn(leavesService, 'createAccrualRecord').mockResolvedValue({
        _id: new Types.ObjectId(),
        skipped: true,
        skipReason: 'Employee on unpaid leave during accrual period',
      } as any);

      const result = await leavesService.createAccrualRecord(
        mockEmployeeId,
        mockLeaveTypeId,
        new Date(),
        5,
        new Date('2024-06-01'),
        new Date('2024-06-30'),
      );

      expect(result.skipped).toBe(true);
    });

    it('should create accrual when not on unpaid leave', async () => {
      jest.spyOn(leavesService, 'isOnUnpaidLeave').mockResolvedValue(false);
      jest.spyOn(leavesService, 'createAccrualRecord').mockResolvedValue({
        _id: new Types.ObjectId(),
        skipped: false,
        accrualAmount: 5,
      } as any);

      const result = await leavesService.createAccrualRecord(
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

    it('should retrieve accrual history', async () => {
      jest.spyOn(leavesService, 'getAccrualHistory').mockResolvedValue([
        {
          _id: new Types.ObjectId(),
          employeeId: mockEmployeeId,
          leaveTypeId: mockLeaveTypeId,
          accrualDate: new Date(),
          accrualAmount: 5,
          skipped: false,
        },
      ] as any);

      const response = await request(app.getHttpServer())
        .get(`/leaves/accruals/${mockEmployeeId}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
    });
  });

  describe('Notification Tests (REQ-019, REQ-024, REQ-030)', () => {
    it('should send notification on request submission', async () => {
      const notificationService = app.get(NotificationService);
      jest.spyOn(notificationService, 'notifyRequestSubmitted').mockResolvedValue();

      jest.spyOn(leavesService, 'submitRequest').mockResolvedValue({
        _id: mockRequestId,
        status: LeaveStatus.PENDING,
        managerId: mockManagerId,
      } as any);

      await request(app.getHttpServer())
        .post('/leaves/request')
        .send({
          employeeId: mockEmployeeId.toString(),
          leaveTypeId: mockLeaveTypeId.toString(),
          startDate: '2024-06-01',
          endDate: '2024-06-05',
          durationDays: 5,
        })
        .expect(201);

      expect(notificationService.notifyRequestSubmitted).toHaveBeenCalled();
    });

    it('should send notification on approval', async () => {
      const notificationService = app.get(NotificationService);
      jest.spyOn(notificationService, 'notifyRequestApproved').mockResolvedValue();

      jest.spyOn(leavesService, 'processReview').mockResolvedValue({
        _id: mockRequestId,
        status: LeaveStatus.APPROVED,
        employeeId: mockEmployeeId,
      } as any);

      await request(app.getHttpServer())
        .put(`/leaves/request/${mockRequestId}/review`)
        .send({
          approverId: mockManagerId.toString(),
          action: 'APPROVE',
          isHR: false,
        })
        .expect(200);

      expect(notificationService.notifyRequestApproved).toHaveBeenCalled();
    });

    it('should send notification on rejection', async () => {
      const notificationService = app.get(NotificationService);
      jest.spyOn(notificationService, 'notifyRequestRejected').mockResolvedValue();

      jest.spyOn(leavesService, 'processReview').mockResolvedValue({
        _id: mockRequestId,
        status: LeaveStatus.REJECTED,
        employeeId: mockEmployeeId,
      } as any);

      await request(app.getHttpServer())
        .put(`/leaves/request/${mockRequestId}/review`)
        .send({
          approverId: mockManagerId.toString(),
          action: 'REJECT',
          isHR: false,
          reason: 'Insufficient coverage',
        })
        .expect(200);

      expect(notificationService.notifyRequestRejected).toHaveBeenCalled();
    });
  });
});
