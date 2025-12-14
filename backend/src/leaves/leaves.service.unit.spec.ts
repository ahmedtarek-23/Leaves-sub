/**
 * Comprehensive Unit Tests for LeavesService
 * 
 * These tests cover individual methods and business logic in isolation
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { LeavesService } from './leaves.service';
import { LeaveRequest } from './models/leave-request.schema';
import { LeaveEntitlement } from './models/leave-entitlement.schema';
import { LeavePolicy } from './models/leave-policy.schema';
import { LeaveAdjustment } from './models/leave-adjustment.schema';
import { LeaveType } from './models/leave-type.schema';
import { LeaveCategory } from './models/leave-category.schema';
import { Calendar } from './models/calendar.schema';
import { Attachment } from './models/attachment.schema';
import { LeaveStatus } from './enums/leave-status.enum';
import { AdjustmentType } from './enums/adjustment-type.enum';
import { TimeManagementService } from '../time-management/time-management.service';
import { EmployeeProfileService } from '../employee-profile/employee-profile.service';
import { PayrollExecutionService } from '../payroll-execution/payroll-execution.service';
import { NotificationService } from './notifications/notification.service';
import { EmployeeProfile } from '../employee-profile/models/employee-profile.schema';

describe('LeavesService Unit Tests', () => {
    let service: LeavesService;
    let leaveRequestModel: any;
    let leaveEntitlementModel: any;
    let leavePolicyModel: any;
    let leaveAdjustmentModel: any;
    let leaveTypeModel: any;
    let leaveCategoryModel: any;
    let calendarModel: any;
    let attachmentModel: any;
    let timeManagementService: any;
    let employeeProfileService: any;
    let payrollExecutionService: any;
    let notificationService: any;

    // Helper to create chainable query mocks
    const createMockQuery = (result: any) => ({
        exec: jest.fn().mockResolvedValue(result),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
    });

    beforeEach(async () => {
        // Create mock models
        const mockLeaveRequestModel = {
            findOne: jest.fn().mockReturnValue(createMockQuery(null)),
            find: jest.fn().mockReturnValue(createMockQuery([])),
            findById: jest.fn().mockReturnValue(createMockQuery(null)),
            findByIdAndUpdate: jest.fn().mockReturnValue(createMockQuery(null)),
            findOneAndUpdate: jest.fn().mockReturnValue(createMockQuery(null)),
            create: jest.fn(),
            save: jest.fn(),
            countDocuments: jest.fn().mockReturnValue(createMockQuery(0)),
        };

        const mockLeaveEntitlementModel = {
            findOne: jest.fn().mockReturnValue(createMockQuery(null)),
            find: jest.fn().mockReturnValue(createMockQuery([])),
            findById: jest.fn().mockReturnValue(createMockQuery(null)),
            findByIdAndUpdate: jest.fn().mockReturnValue(createMockQuery(null)),
            findOneAndUpdate: jest.fn().mockReturnValue(createMockQuery(null)),
            create: jest.fn(),
            save: jest.fn(),
            countDocuments: jest.fn().mockReturnValue(createMockQuery(0)),
        };

        const mockOtherModels = {
            findOne: jest.fn().mockReturnValue(createMockQuery(null)),
            find: jest.fn().mockReturnValue(createMockQuery([])),
            findById: jest.fn().mockReturnValue(createMockQuery(null)),
            findByIdAndUpdate: jest.fn().mockReturnValue(createMockQuery(null)),
            findOneAndUpdate: jest.fn().mockReturnValue(createMockQuery(null)),
            create: jest.fn(),
            save: jest.fn(),
            countDocuments: jest.fn().mockReturnValue(createMockQuery(0)),
        };

        const mockEmployeeProfileModel = {
            findOne: jest.fn().mockReturnValue(createMockQuery(null)),
            find: jest.fn().mockReturnValue(createMockQuery([])),
            findById: jest.fn().mockReturnValue(createMockQuery(null)),
            findByIdAndUpdate: jest.fn().mockReturnValue(createMockQuery(null)),
            findOneAndUpdate: jest.fn().mockReturnValue(createMockQuery(null)),
            create: jest.fn(),
            save: jest.fn(),
            countDocuments: jest.fn().mockReturnValue(createMockQuery(0)),
        };

        // Create mock services
        const mockTimeManagementService = {
            blockLeavePeriod: jest.fn().mockResolvedValue({}),
        };

        const mockEmployeeProfileService = {
            getEmployeeProfile: jest.fn().mockResolvedValue({
                _id: new Types.ObjectId(),
                supervisorPositionId: new Types.ObjectId(),
                primaryPositionId: new Types.ObjectId(),
            }),
            getTeamMembers: jest.fn().mockResolvedValue([]),
        };

        const mockPayrollExecutionService = {
            applyLeaveAdjustment: jest.fn().mockResolvedValue({}),
            processFinalPayment: jest.fn().mockResolvedValue({}),
        };

        const mockNotificationService = {
            sendLeaveRequestNotification: jest.fn().mockResolvedValue({}),
            sendReviewNotification: jest.fn().mockResolvedValue({}),
            sendCancellationNotification: jest.fn().mockResolvedValue({}),
            sendMedicalVerificationNotification: jest.fn().mockResolvedValue({}),
            sendEscalationNotification: jest.fn().mockResolvedValue({}),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LeavesService,
                { provide: getModelToken(LeaveRequest.name), useValue: mockLeaveRequestModel },
                { provide: getModelToken(LeaveEntitlement.name), useValue: mockLeaveEntitlementModel },
                { provide: getModelToken(LeavePolicy.name), useValue: mockOtherModels },
                { provide: getModelToken(LeaveAdjustment.name), useValue: mockOtherModels },
                { provide: getModelToken(LeaveType.name), useValue: mockOtherModels },
                { provide: getModelToken(LeaveCategory.name), useValue: mockOtherModels },
                { provide: getModelToken(Calendar.name), useValue: mockOtherModels },
                { provide: getModelToken(Attachment.name), useValue: mockOtherModels },
                { provide: getModelToken(EmployeeProfile.name), useValue: mockEmployeeProfileModel },
                { provide: TimeManagementService, useValue: mockTimeManagementService },
                { provide: EmployeeProfileService, useValue: mockEmployeeProfileService },
                { provide: PayrollExecutionService, useValue: mockPayrollExecutionService },
                { provide: NotificationService, useValue: mockNotificationService },
            ],
        }).compile();

        service = module.get<LeavesService>(LeavesService);
        leaveRequestModel = module.get(getModelToken(LeaveRequest.name));
        leaveEntitlementModel = module.get(getModelToken(LeaveEntitlement.name));
        leavePolicyModel = module.get(getModelToken(LeavePolicy.name));
        leaveAdjustmentModel = module.get(getModelToken(LeaveAdjustment.name));
        leaveTypeModel = module.get(getModelToken(LeaveType.name));
        leaveCategoryModel = module.get(getModelToken(LeaveCategory.name));
        calendarModel = module.get(getModelToken(Calendar.name));
        attachmentModel = module.get(getModelToken(Attachment.name));
        timeManagementService = module.get(TimeManagementService);
        employeeProfileService = module.get(EmployeeProfileService);
        payrollExecutionService = module.get(PayrollExecutionService);
        notificationService = module.get(NotificationService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getEmployeeBalance', () => {
        it('should return employee balance for all leave types', async () => {
            const employeeId = new Types.ObjectId().toString();
            const mockEntitlements = [
                {
                    leaveTypeId: { _id: new Types.ObjectId(), name: 'Annual Leave' },
                    yearlyEntitlement: 20,
                    accrued: 20,
                    carryForward: 0,
                    taken: 5,
                    pending: 2,
                    remaining: 13,
                },
            ];

            leaveEntitlementModel.find.mockReturnValue(createMockQuery(mockEntitlements));

            const result = await service.getEmployeeBalance(employeeId);

            expect(result.employeeId).toBe(employeeId);
            expect(result.balances).toHaveLength(1);
            expect(result.balances[0].remaining).toBe(13);
            expect(result.balances[0].taken).toBe(5);
        });

        it('should return empty balances if no entitlements found', async () => {
            const employeeId = new Types.ObjectId().toString();
            leaveEntitlementModel.find.mockReturnValue(createMockQuery([]));

            const result = await service.getEmployeeBalance(employeeId);

            expect(result.employeeId).toBe(employeeId);
            expect(result.balances).toHaveLength(0);
        });
    });

    describe('manualAdjustBalance', () => {
        it('should create adjustment with audit trail', async () => {
            const employeeId = new Types.ObjectId().toString();
            const leaveTypeId = new Types.ObjectId().toString();
            const hrUserId = new Types.ObjectId().toString();
            const adjustmentAmount = 5;
            const reason = 'Correction for previous error';

            const mockEntitlement = {
                _id: new Types.ObjectId(),
                employeeId: new Types.ObjectId(employeeId),
                leaveTypeId: new Types.ObjectId(leaveTypeId),
                remaining: 10,
                save: jest.fn().mockResolvedValue(this),
            };

            leaveEntitlementModel.findOne.mockReturnValue(createMockQuery(mockEntitlement));
            leaveEntitlementModel.findOneAndUpdate.mockReturnValue(
                createMockQuery({ ...mockEntitlement, remaining: 15 })
            );
            leaveAdjustmentModel.create.mockResolvedValue({
                _id: new Types.ObjectId(),
                employeeId: new Types.ObjectId(employeeId),
                leaveTypeId: new Types.ObjectId(leaveTypeId),
                amount: adjustmentAmount,
                reason,
                adjustmentType: AdjustmentType.ADD,
                hrUserId: new Types.ObjectId(hrUserId),
            });

            const result = await service.manualAdjustBalance({
                employeeId,
                leaveTypeId,
                amount: adjustmentAmount,
                reason,
                hrUserId,
            });

            expect(leaveAdjustmentModel.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    employeeId: expect.any(Types.ObjectId),
                    leaveTypeId: expect.any(Types.ObjectId),
                    amount: adjustmentAmount,
                    reason,
                    adjustmentType: AdjustmentType.ADD,
                    hrUserId: expect.any(Types.ObjectId),
                })
            );
            expect(result.remaining).toBe(15);
        });

        it('should throw error if justification is missing', async () => {
            await expect(
                service.manualAdjustBalance({
                    employeeId: new Types.ObjectId().toString(),
                    leaveTypeId: new Types.ObjectId().toString(),
                    amount: 5,
                    reason: '',
                    hrUserId: new Types.ObjectId().toString(),
                })
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw error if hrUserId is missing', async () => {
            await expect(
                service.manualAdjustBalance({
                    employeeId: new Types.ObjectId().toString(),
                    leaveTypeId: new Types.ObjectId().toString(),
                    amount: 5,
                    reason: 'Test',
                    hrUserId: '',
                })
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('cancelRequest', () => {
        it('should cancel a pending request', async () => {
            const requestId = new Types.ObjectId().toString();
            const employeeId = new Types.ObjectId().toString();
            const mockRequest = {
                _id: new Types.ObjectId(requestId),
                employeeId: new Types.ObjectId(employeeId),
                status: LeaveStatus.PENDING,
                durationDays: 5,
                save: jest.fn().mockResolvedValue(this),
            };

            leaveRequestModel.findById.mockReturnValue(createMockQuery(mockRequest));

            const result = await service.cancelRequest(requestId, employeeId);

            expect(result.status).toBe(LeaveStatus.CANCELLED);
            expect(mockRequest.save).toHaveBeenCalled();
        });

        it('should throw error if request not found', async () => {
            leaveRequestModel.findById.mockReturnValue(createMockQuery(null));

            await expect(
                service.cancelRequest(new Types.ObjectId().toString(), new Types.ObjectId().toString())
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw error if employee does not own the request', async () => {
            const requestId = new Types.ObjectId().toString();
            const employeeId = new Types.ObjectId().toString();
            const differentEmployeeId = new Types.ObjectId().toString();
            const mockRequest = {
                _id: new Types.ObjectId(requestId),
                employeeId: new Types.ObjectId(employeeId),
                status: LeaveStatus.PENDING,
            };

            leaveRequestModel.findById.mockReturnValue(createMockQuery(mockRequest));

            await expect(service.cancelRequest(requestId, differentEmployeeId)).rejects.toThrow(
                BadRequestException
            );
        });
    });

    describe('getRequestById', () => {
        it('should return request by ID', async () => {
            const requestId = new Types.ObjectId().toString();
            const mockRequest = {
                _id: new Types.ObjectId(requestId),
                employeeId: new Types.ObjectId(),
                status: LeaveStatus.PENDING,
            };

            leaveRequestModel.findById.mockReturnValue(createMockQuery(mockRequest));

            const result = await service.getRequestById(requestId);

            expect(result._id.toString()).toBe(requestId);
        });

        it('should throw NotFoundException if request not found', async () => {
            leaveRequestModel.findById.mockReturnValue(createMockQuery(null));

            await expect(service.getRequestById(new Types.ObjectId().toString())).rejects.toThrow(
                NotFoundException
            );
        });
    });

    describe('calculateWorkingDays', () => {
        it('should calculate working days excluding weekends', async () => {
            const from = new Date('2024-01-15'); // Monday
            const to = new Date('2024-01-19'); // Friday

            calendarModel.findOne.mockReturnValue(createMockQuery(null));
            calendarModel.find.mockReturnValue(createMockQuery([]));

            const result = await service['calculateWorkingDays'](from, to);

            expect(result).toBe(5); // Monday to Friday = 5 working days
        });

        it('should exclude holidays from working days', async () => {
            const from = new Date('2024-01-15'); // Monday
            const to = new Date('2024-01-17'); // Wednesday
            const holidayDate = new Date('2024-01-16'); // Tuesday

            calendarModel.findOne.mockReturnValue(createMockQuery({ holidays: [holidayDate] }));
            calendarModel.find.mockReturnValue(createMockQuery([]));

            const result = await service['calculateWorkingDays'](from, to);

            expect(result).toBe(2); // Monday, Wednesday (Tuesday is holiday)
        });
    });

    describe('validateSickLeaveLimits', () => {
        it('should throw error if sick leave limit exceeded', async () => {
            const employeeId = new Types.ObjectId().toString();
            const requestedDays = 10;

            const mockSickLeaveType = { _id: new Types.ObjectId(), name: 'Sick Leave' };
            leaveTypeModel.findOne.mockReturnValue(createMockQuery(mockSickLeaveType));

            const mockSickLeaves = [
                { durationDays: 90 },
                { durationDays: 90 },
            ];
            leaveRequestModel.find.mockReturnValue(createMockQuery(mockSickLeaves));

            const mockPolicy = { sickCycleMaxDays: 180 };
            leavePolicyModel.findOne.mockReturnValue(createMockQuery(mockPolicy));

            await expect(
                service['validateSickLeaveLimits'](employeeId, requestedDays)
            ).rejects.toThrow(BadRequestException);
        });
    });
});

