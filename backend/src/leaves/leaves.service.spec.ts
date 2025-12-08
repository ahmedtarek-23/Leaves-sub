import { Test, TestingModule } from '@nestjs/testing';
import { LeavesService } from './leaves.service';
<<<<<<< Updated upstream
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { LeaveStatus } from './enums/leave-status.enum'; // Import your Enum
import { Types } from 'mongoose';

// 1. Mock the Mongoose Models
// You must mock all 8 models injected into the LeavesService constructor
const mockLeaveRequestModel = {
  findById: jest.fn(),
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  create: jest.fn(),
  save: jest.fn().mockResolvedValue({ id: 'newId', status: LeaveStatus.PENDING }),
};
const mockLeaveEntitlementModel = {
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};
const mockOtherModels = { 
  // Add mock definitions for your other 6 models (LeavePolicy, LeaveAdjustment, etc.) 
  // You can set them to simple empty objects if they aren't used in the tested methods
};

// 2. Mock the External Servsices (Dependencies)
const mockTimeManagementService = {
  blockAttendance: jest.fn().mockResolvedValue(true),
};
const mockPayrollExecutionService = {
  applyAdjustment: jest.fn().mockResolvedValue(true),
  processFinalPayment: jest.fn().mockResolvedValue(true),
};
const mockEmployeeProfileService = {
  // Mock any required methods here
};
=======
>>>>>>> Stashed changes

describe('LeavesService', () => {
  let service: LeavesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
<<<<<<< Updated upstream
      providers: [
        LeavesService,
        // Provide Mongoose Mocks using their Model Tokens
        { provide: getModelToken('LeaveRequest'), useValue: mockLeaveRequestModel },
        { provide: getModelToken('LeaveEntitlement'), useValue: mockLeaveEntitlementModel },
        // Add all other 6 model tokens here (LeavePolicy, LeaveAdjustment, etc.)
        { provide: getModelToken('LeavePolicy'), useValue: mockOtherModels },
        // ... (remaining 5 models)
        
        // Provide External Service Mocks
        { provide: 'TimeManagementService', useValue: mockTimeManagementService },
        { provide: 'PayrollExecutionService', useValue: mockPayrollExecutionService },
        { provide: 'EmployeeProfileService', useValue: mockEmployeeProfileService },
      ],
=======
      providers: [LeavesService],
>>>>>>> Stashed changes
    }).compile();

    service = module.get<LeavesService>(LeavesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
<<<<<<< Updated upstream

  // =======================================================================
  // TEST SUITE 1: SUBMISSION LOGIC (BR 29, BR 31)
  // =======================================================================

  describe('submitRequest', () => {
    const baseRequest = { employeeId: 'E001', leaveTypeId: 'T001', durationDays: 5 };
    const mockEntitlement = { remaining: 10, save: jest.fn() };

    it('should set status to PENDING if balance is sufficient (BR 31 met)', async () => {
      mockLeaveEntitlementModel.findOne.mockResolvedValue(mockEntitlement);
      mockLeaveRequestModel.save.mockResolvedValue({ status: LeaveStatus.PENDING });

      const result = await service.submitRequest(baseRequest);
      expect(result.status).toBe(LeaveStatus.PENDING);
    });

    it('should flag for HR conversion if balance is exceeded but some remains (BR 29)', async () => {
      // 10 days requested, 5 remaining
      const overRequest = { ...baseRequest, durationDays: 10 };
      mockLeaveEntitlementModel.findOne.mockResolvedValue({ remaining: 5 });
      
      const result = await service.submitRequest(overRequest);
      expect(result.status).toBe(LeaveStatus.PENDING); // Status set to PENDING for internal routing
      expect(result.status).not.toBe(LeaveStatus.APPROVED);
    });

    it('should throw BadRequestException if balance is zero (BR 29 strict block)', async () => {
      const zeroEntitlement = { remaining: 0 };
      mockLeaveEntitlementModel.findOne.mockResolvedValue(zeroEntitlement);

      await expect(service.submitRequest(baseRequest)).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  // =======================================================================
  // TEST SUITE 2: APPROVAL LOGIC (REQ-021, REQ-025, REQ-042)
  // =======================================================================

  describe('processReview', () => {
    const mockApprovedRequest = { id: 'R001', status: LeaveStatus.PENDING, durationDays: 5, employeeId: 'E001' };

    it('should set status to APPROVED and trigger integration if HR approves', async () => {
      mockLeaveRequestModel.findById.mockResolvedValue(mockApprovedRequest);
      mockLeaveRequestModel.findByIdAndUpdate.mockResolvedValue({ status: LeaveStatus.APPROVED });
      
      const reviewData = { action: 'APPROVE', isHR: true, decidedBy: 'HR001' };

      const result = await service.processReview(mockApprovedRequest.id, reviewData);
      
      // Check status and integration calls
      expect(result.status).toBe(LeaveStatus.APPROVED);
      expect(mockTimeManagementService.blockAttendance).toHaveBeenCalled();
      expect(mockPayrollExecutionService.applyAdjustment).toHaveBeenCalled();
    });

    it('should set status to REJECTED if manager rejects', async () => {
      mockLeaveRequestModel.findById.mockResolvedValue(mockApprovedRequest);
      mockLeaveRequestModel.findByIdAndUpdate.mockResolvedValue({ status: LeaveStatus.REJECTED });
      
      const reviewData = { action: 'REJECT', isHR: false, decidedBy: 'MGR001' };

      const result = await service.processReview(mockApprovedRequest.id, reviewData);
      
      // Check status and integration calls
      expect(result.status).toBe(LeaveStatus.REJECTED);
      expect(mockTimeManagementService.blockAttendance).not.toHaveBeenCalled();
    });
  });
  
  // =======================================================================
  // TEST SUITE 3: OFFBOARDING LOGIC (BR 53)
  // =======================================================================

  describe('processFinalSettlement', () => {
    const employeeId = 'E001';
    const dailyRate = 100;
    const mockLeaveTypeId = new Types.ObjectId();
    
    // Set up model to resolve the necessary entitlement document
    beforeEach(() => {
        mockLeaveEntitlementModel.findOne.mockResolvedValue({ remaining: 40, leaveTypeId: mockLeaveTypeId });
    });

    it('should enforce the 30-day cap on unused leave (BR 53)', async () => {
        // Remaining days is 40 (over cap)
        const result = await service.processFinalSettlement(employeeId, dailyRate);

        // Expect calculation based on 30 days (max cap)
        expect(result.unusedDays).toBe(30);
        expect(result.encashmentAmount).toBe(30 * dailyRate);
    });

    it('should calculate encashment correctly if days are under the cap', async () => {
        // Remaining days is 15 (under cap)
        mockLeaveEntitlementModel.findOne.mockResolvedValue({ remaining: 15, leaveTypeId: mockLeaveTypeId });
        
        const result = await service.processFinalSettlement(employeeId, dailyRate);

        // Expect calculation based on 15 days
        expect(result.unusedDays).toBe(15);
        expect(result.encashmentAmount).toBe(15 * dailyRate);
        expect(mockPayrollExecutionService.processFinalPayment).toHaveBeenCalledWith(
          expect.objectContaining({ encashmentAmount: 1500 })
        );
    });
  });

  // Reset mocks after each test to ensure test isolation
  afterEach(() => {
    jest.clearAllMocks();
  });
});
=======
});
>>>>>>> Stashed changes
