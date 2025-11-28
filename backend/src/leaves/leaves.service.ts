import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

// Import all 8 schemas
import { LeaveRequest } from './models/leave-request.schema';
import { LeavePolicy } from './models/leave-policy.schema';
import { LeaveEntitlement } from './models/leave-entitlement.schema';
import { LeaveAdjustment } from './models/leave-adjustment.schema';
import { LeaveType } from './models/leave-type.schema';
import { LeaveCategory } from './models/leave-category.schema';
import { Calendar } from './models/calendar.schema';
import { Attachment } from './models/attachment.schema';

// Import Enums
import { LeaveStatus } from './enums/leave-status.enum'; 
import { AdjustmentType } from './enums/adjustment-type.enum';

// Placeholder Imports for dependent services
import { TimeManagementService } from '../time-management/time-management.service';
import { EmployeeProfileService } from '../employee-profile/employee-profile.service'; 
import { PayrollExecutionService } from '../payroll-execution/payroll-execution.service'; 

@Injectable()
export class LeavesService {
  private readonly logger = new Logger(LeavesService.name);

  constructor(
    // 1. INJECT ALL 8 MONGOOSE MODELS
    @InjectModel(LeaveRequest.name) private leaveRequestModel: Model<LeaveRequest>,
    @InjectModel(LeaveType.name) private leaveTypeModel: Model<LeaveType>,
    @InjectModel(LeavePolicy.name) private leavePolicyModel: Model<LeavePolicy>,
    @InjectModel(LeaveEntitlement.name) private leaveEntitlementModel: Model<LeaveEntitlement>,
    @InjectModel(LeaveCategory.name) private leaveCategoryModel: Model<LeaveCategory>,
    @InjectModel(LeaveAdjustment.name) private leaveAdjustmentModel: Model<LeaveAdjustment>,
    @InjectModel(Calendar.name) private calendarModel: Model<Calendar>,
    @InjectModel(Attachment.name) private attachmentModel: Model<Attachment>,
    
    // 2. INJECT ALL DEPENDENT SERVICES
    private readonly timeManagementService: TimeManagementService,
    private readonly employeeProfileService: EmployeeProfileService,
    private readonly payrollExecutionService: PayrollExecutionService, 
  ) {}

  // REQ-015: Handles submission and validation (BR 31, BR 29)
  async submitRequest(requestData: any): Promise<LeaveRequest> { 
    const employeeId = requestData.employeeId;
    const requestedDays = requestData.durationDays;
    const leaveTypeId = requestData.leaveTypeId;

    const entitlement = await this.leaveEntitlementModel.findOne({ employeeId, leaveTypeId }).exec();

    if (!entitlement) {
        throw new NotFoundException(`No valid entitlement found for leave type ID: ${leaveTypeId}.`);
    }

    // Validation (BR 31) & Overlimit Handling (BR 29)
    if (requestedDays > entitlement.remaining) {
        if (entitlement.remaining > 0) {
            requestData.status = LeaveStatus.PENDING; 
            this.logger.warn(`Request exceeds paid balance. Flagging for HR conversion.`);
        } else {
            throw new BadRequestException(`Insufficient balance. Request blocked. (BR 29)`); 
        }
    } else {
        requestData.status = LeaveStatus.PENDING; // Normal approval flow (REQ-020)
    }

    const newRequest = new this.leaveRequestModel(requestData);
    return newRequest.save(); 
  }

  // REQ-021, REQ-025: Handles multi-level approval and finalization
  async processReview(requestId: string, reviewData: any): Promise<LeaveRequest> {
    const request = await this.leaveRequestModel.findById(requestId).exec();
    
    // Initial Null Check
    if (!request) {
        throw new NotFoundException(`Request ${requestId} not found.`);
    }

    let newStatus: LeaveStatus = request.status as LeaveStatus;
    
    // Determine New Status based on action and role
    if (reviewData.isHR) {
        if (reviewData.action === 'APPROVE' || reviewData.action === 'OVERRIDE') {
            newStatus = LeaveStatus.APPROVED; 
        } else if (reviewData.action === 'REJECT') {
            newStatus = LeaveStatus.REJECTED;
        }
    } else {
        // Manager Review (Use PENDING for next status if approved by manager)
        if (reviewData.action === 'APPROVE') {
            newStatus = LeaveStatus.PENDING; 
        } else if (reviewData.action === 'REJECT') {
            newStatus = LeaveStatus.REJECTED;
        }
    }
    
    // Update the record status and log the action
    const updatedRequest = await this.leaveRequestModel.findByIdAndUpdate(
        requestId, 
        { 
            status: newStatus, 
            $push: { approvalFlow: { ...reviewData, decidedAt: new Date() } }
        },
        { new: true }
    ).exec();
    
    // FIX: Final Null Check before using/returning (Resolves final error)
    if (!updatedRequest) {
        throw new NotFoundException(`Request ${requestId} was not found for update.`);
    }

    // Trigger Integration (REQ-042)
    if (newStatus === LeaveStatus.APPROVED) {
        await this.finalizeIntegration(updatedRequest);
    }

    return updatedRequest;
  }

  // REQ-040: Employee Query
  async getEmployeeBalance(employeeId: string): Promise<any> {
    const balances = await this.leaveEntitlementModel.find({ employeeId }).exec();
    return { employeeId, balances };
  }

  // REQ-006: Policy Management
  async createPolicy(policyData: any): Promise<LeavePolicy> {
    if (!policyData.payrollPayCode) {
        throw new BadRequestException('Policy must include a payroll pay code (REQ-006).');
    }
    const newPolicy = new this.leavePolicyModel(policyData);
    return newPolicy.save();
  }

  // REQ-013, BR 17: Auditing/Management
  async manualAdjustBalance(adjustmentData: any): Promise<any> {
    const { employeeId, leaveTypeId, amount, reason, hrUserId } = adjustmentData; 

    if (!reason || !hrUserId) {
        throw new BadRequestException('Justification (reason) and HR User ID are required for manual adjustment (BR 17).');
    }

    // 1. Update the balance
    const updatedBalance = await this.leaveEntitlementModel.findOneAndUpdate(
        { employeeId, leaveTypeId },
        { $inc: { remaining: amount } }, 
        { new: true }
    ).exec();

    // 2. Log the change for audit (BR 17)
    await this.leaveAdjustmentModel.create({
        employeeId,
        leaveTypeId,
        amount: amount,
        reason: reason,
        adjustmentType: (amount > 0) ? AdjustmentType.ADD : AdjustmentType.DEDUCT,
        hrUserId: hrUserId,
        timestamp: new Date(),
    });
    return updatedBalance;
  }

  // BR 55: Reporting/Monitoring
  async getIrregularLeaveReport(managerId: string): Promise<any> {
    return []; 
  }

  // OFF-013, BR 53: Offboarding
  async processFinalSettlement(employeeId: string, dailySalaryRate: number): Promise<any> {
    const ANNUAL_LEAVE_TYPE_ID = new Types.ObjectId('your_annual_leave_id'); 
    const MAX_ENCASH_DAYS = 30; // Capped at 30 days (BR 53)

    const entitlement = await this.leaveEntitlementModel.findOne({ 
        employeeId, 
        leaveTypeId: ANNUAL_LEAVE_TYPE_ID 
    }).exec();

    if (!entitlement) {
        throw new NotFoundException(`Annual leave entitlement not found for employee ${employeeId}.`);
    }
    
    const unusedDays = Math.min(entitlement.remaining, MAX_ENCASH_DAYS);
    const encashmentAmount = dailySalaryRate * unusedDays;

    // External Dependency 
    this.payrollExecutionService.processFinalPayment({ employeeId, encashmentAmount }); 

    return { unusedDays, encashmentAmount };
  }
// Inside leaves.service.ts
private async finalizeIntegration(request: LeaveRequest): Promise<void> {
    
    // 1. Update Balances (REQ-042)
    await this.leaveEntitlementModel.findOneAndUpdate(
        { employeeId: request.employeeId, leaveTypeId: request.leaveTypeId },
        { $inc: { taken: request.durationDays, remaining: -request.durationDays } }
    ).exec();
    
    // 2. Sync Systems (REQ-042) - Requires external fix for method existence
    this.timeManagementService.blockAttendance(request); 
    this.payrollExecutionService.applyAdjustment(request); 
    
    // 3. Mark request as synced (FINAL FIX APPLIED HERE)
    // We cast 'request' to allow access to the Mongoose property '_id'
    await this.leaveRequestModel.findByIdAndUpdate((request as any)._id, { isSynced: true }).exec();
}}