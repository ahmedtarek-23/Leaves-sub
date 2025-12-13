import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Document } from 'mongoose';

// Import all schemas
import { LeaveRequest } from './models/leave-request.schema';
import { LeavePolicy } from './models/leave-policy.schema';
import { LeaveEntitlement } from './models/leave-entitlement.schema';
import { LeaveAdjustment } from './models/leave-adjustment.schema';
import { LeaveType } from './models/leave-type.schema';
import { LeaveCategory } from './models/leave-category.schema';
import { Calendar } from './models/calendar.schema';
import { Attachment } from './models/attachment.schema';
import { NotificationService } from './notifications/notification.service';

// Import Enums
import { LeaveStatus } from './enums/leave-status.enum';
import { AdjustmentType } from './enums/adjustment-type.enum';
import { AccrualMethod } from './enums/accrual-method.enum';
import { RoundingRule } from './enums/rounding-rule.enum';

// Import dependent services
import { TimeManagementService } from '../time-management/time-management.service';
import { EmployeeProfileService } from '../employee-profile/employee-profile.service';
import { PayrollExecutionService } from '../payroll-execution/payroll-execution.service';

@Injectable()
export class LeavesService {
    private readonly logger = new Logger(LeavesService.name);

    constructor(
        // Inject all Mongoose models
        @InjectModel(LeaveRequest.name) private leaveRequestModel: Model<LeaveRequest & Document>,
        @InjectModel(LeaveType.name) private leaveTypeModel: Model<LeaveType>,
        @InjectModel(LeavePolicy.name) private leavePolicyModel: Model<LeavePolicy>,
        @InjectModel(LeaveEntitlement.name) private leaveEntitlementModel: Model<LeaveEntitlement>,
        @InjectModel(LeaveCategory.name) private leaveCategoryModel: Model<LeaveCategory>,
        @InjectModel(LeaveAdjustment.name) private leaveAdjustmentModel: Model<LeaveAdjustment>,
        @InjectModel(Calendar.name) private calendarModel: Model<Calendar>,
        @InjectModel(Attachment.name) private attachmentModel: Model<Attachment>,

        // Inject dependent services
        private readonly timeManagementService: TimeManagementService,
        private readonly employeeProfileService: EmployeeProfileService,
        private readonly payrollExecutionService: PayrollExecutionService,
        private readonly notificationService: NotificationService,
    ) {}

    // REQ-015: Submit leave request with validation
    async submitRequest(requestData: {
        employeeId: string;
        leaveTypeId: string;
        dates: { from: Date; to: Date };
        justification?: string;
        isPostLeave?: boolean;
    }): Promise<LeaveRequest> {
        const { employeeId, leaveTypeId, dates, justification, isPostLeave } = requestData;

        // REQ-031: Validate post-leave grace period
        if (isPostLeave) {
            await this.validatePostLeaveGracePeriod(dates.to);
        }

        // Calculate duration excluding weekends and holidays (BR 23)
        const durationDays = await this.calculateWorkingDays(dates.from, dates.to);

        // Find entitlement
        const entitlement = await this.leaveEntitlementModel.findOne({
            employeeId: new Types.ObjectId(employeeId),
            leaveTypeId: new Types.ObjectId(leaveTypeId),
        }).exec();

        if (!entitlement) {
            throw new NotFoundException(`No valid entitlement found for leave type ID: ${leaveTypeId}.`);
        }

        // Find policy for rounding rules and validation
        const policy = await this.leavePolicyModel.findOne({
            leaveTypeId: new Types.ObjectId(leaveTypeId),
        }).exec();

        // Apply rounding rules (REQ-003)
        const roundedDuration = this.applyRoundingRule(durationDays, policy?.roundingRule);

        // Store both actual and rounded duration
        const actualDuration = durationDays;
        const roundedDurationValue = roundedDuration;

        // Validate sick leave cycle limits (REQ-011)
        const leaveType = await this.leaveTypeModel.findById(leaveTypeId).exec();
        if (leaveType?.name?.toLowerCase().includes('sick') || leaveType?.name?.toLowerCase().includes('medical')) {
            await this.validateSickLeaveLimits(employeeId, roundedDurationValue);
        }

        // Check for overlapping leaves (BR 31)
        await this.checkOverlappingLeaves(employeeId, dates.from, dates.to);

        // Check for team scheduling conflicts (BR 28)
        await this.checkTeamSchedulingConflicts(employeeId, dates.from, dates.to);

        // Validation (BR 31) & Overlimit Handling (BR 29)
        let status = LeaveStatus.PENDING;
        let requiresHRConversion = false;
        let excessDays = 0;

        if (roundedDurationValue > entitlement.remaining) {
            if (entitlement.remaining > 0) {
                status = LeaveStatus.PENDING;
                requiresHRConversion = true;
                excessDays = roundedDurationValue - entitlement.remaining;
                this.logger.warn(`Request exceeds paid balance by ${excessDays} days. Flagging for HR conversion.`);
            } else {
                throw new BadRequestException(`Insufficient balance. Request blocked. (BR 29)`);
            }
        }

        // Get manager ID from employee profile
        const employeeProfile = await this.getEmployeeProfile(employeeId);
        const managerId = employeeProfile?.supervisorPositionId || employeeProfile?.primaryPositionId;

        // Create leave request
        const newRequest = new this.leaveRequestModel({
            employeeId: new Types.ObjectId(employeeId),
            leaveTypeId: new Types.ObjectId(leaveTypeId),
            dates: {
                from: dates.from,
                to: dates.to,
            },
            durationDays: roundedDurationValue,
            actualDuration,
            roundedDuration: roundedDurationValue,
            justification,
            status,
            requiresHRConversion,
            excessDays,
            managerId: managerId ? new Types.ObjectId(managerId.toString()) : undefined,
            approvalFlow: [],
            isSynced: false,
            attachments: [],
            hasAttachments: false,
        });

        const savedRequest = await newRequest.save();

        // Send notification to manager (REQ-019)
        if (managerId) {
            await this.notificationService.sendLeaveRequestNotification(savedRequest._id.toString());
        }

        // Apply automatic flagging heuristics (REQ-039)
        await this.applyFlaggingHeuristics(savedRequest);

        return savedRequest;
    }

    // REQ-031: Validate post-leave grace period
    private async validatePostLeaveGracePeriod(leaveEndDate: Date): Promise<void> {
        // Get grace period from configuration (default 7 days)
        const GRACE_PERIOD_DAYS = 7;
        const today = new Date();
        const daysSinceLeave = Math.floor((today.getTime() - leaveEndDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceLeave > GRACE_PERIOD_DAYS) {
            throw new BadRequestException(
                `Post-leave request submission exceeded grace period. Maximum ${GRACE_PERIOD_DAYS} days allowed after leave end date.`
            );
        }
    }

    // BR 23: Calculate working days excluding weekends and holidays
    private async calculateWorkingDays(startDate: Date, endDate: Date): Promise<number> {
        const start = new Date(startDate);
        const end = new Date(endDate);
        let workingDays = 0;

        // Get calendar for the year
        const year = start.getFullYear();
        const calendar = await this.calendarModel.findOne({ year }).exec();
        const holidays = calendar?.holidays || [];

        // Get holiday dates (assuming holidays are stored as ObjectIds referencing Holiday collection)
        // For now, we'll just exclude weekends
        const currentDate = new Date(start);
        while (currentDate <= end) {
            const dayOfWeek = currentDate.getDay();
            // Exclude weekends (Saturday = 6, Sunday = 0)
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                workingDays++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return workingDays;
    }

    // Apply rounding rules
    private applyRoundingRule(duration: number, roundingRule?: RoundingRule): number {
        switch (roundingRule) {
            case RoundingRule.ROUND:
                return Math.round(duration);
            case RoundingRule.ROUND_UP:
                return Math.ceil(duration);
            case RoundingRule.ROUND_DOWN:
                return Math.floor(duration);
            case RoundingRule.NONE:
            default:
                return duration;
        }
    }

    // Validate sick leave limits
    private async validateSickLeaveLimits(employeeId: string, requestedDays: number): Promise<void> {
        const threeYearsAgo = new Date();
        threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

        const sickLeaveType = await this.leaveTypeModel.findOne({
            $or: [
                { name: { $regex: /sick/i } },
                { name: { $regex: /medical/i } },
            ],
        }).exec();

        if (!sickLeaveType) {
            return; // No sick leave type configured
        }

        const sickLeaves = await this.leaveRequestModel.find({
            employeeId: new Types.ObjectId(employeeId),
            leaveTypeId: sickLeaveType._id,
            status: { $in: [LeaveStatus.APPROVED, LeaveStatus.PENDING] },
            'dates.from': { $gte: threeYearsAgo },
        }).exec();

        const totalSickDays = sickLeaves.reduce((total, leave) => total + leave.durationDays, 0);

        const policy = await this.leavePolicyModel.findOne({
            leaveTypeId: sickLeaveType._id,
        }).exec();

        const maxSickDays = policy?.sickCycleMaxDays || 180;

        if (totalSickDays + requestedDays > maxSickDays) {
            throw new BadRequestException(
                `Sick leave limit exceeded. You have used ${totalSickDays} days in the last 3 years. ` +
                `Maximum ${maxSickDays} days allowed. Requested ${requestedDays} days would exceed this limit.`
            );
        }
    }

    // Check for overlapping leaves
    private async checkOverlappingLeaves(employeeId: string, startDate: Date, endDate: Date): Promise<void> {
        const overlappingLeaves = await this.leaveRequestModel.find({
            employeeId: new Types.ObjectId(employeeId),
            status: { $in: [LeaveStatus.APPROVED, LeaveStatus.PENDING] },
            $or: [
                {
                    'dates.from': { $lte: endDate },
                    'dates.to': { $gte: startDate },
                },
            ],
        }).exec();

        if (overlappingLeaves.length > 0) {
            throw new BadRequestException(
                `Leave request overlaps with existing approved or pending leave requests.`
            );
        }
    }

    // Check team scheduling conflicts
    private async checkTeamSchedulingConflicts(employeeId: string, startDate: Date, endDate: Date): Promise<void> {
        try {
            const employeeProfile = await this.getEmployeeProfile(employeeId);
            const managerId = employeeProfile?.supervisorPositionId || employeeProfile?.primaryPositionId;

            if (managerId) {
                // Get team members (simplified - would need proper implementation)
                const teamMembers = await this.getTeamMembers(managerId.toString());
                const teamMemberIds = teamMembers
                    .map((member: any) => member._id)
                    .filter((id: any) => id.toString() !== employeeId);

                if (teamMemberIds.length > 0) {
                    const conflictingLeaves = await this.leaveRequestModel.find({
                        employeeId: { $in: teamMemberIds },
                        status: { $in: [LeaveStatus.APPROVED, LeaveStatus.PENDING] },
                        $or: [
                            {
                                'dates.from': { $lte: endDate },
                                'dates.to': { $gte: startDate },
                            },
                        ],
                    }).exec();

                    if (conflictingLeaves.length > 0) {
                        this.logger.warn(
                            `Team scheduling conflict detected for employee ${employeeId}. ` +
                            `${conflictingLeaves.length} team members on leave during this period.`
                        );
                    }
                }
            }
        } catch (error) {
            this.logger.warn(`Could not check team scheduling conflicts: ${error.message}`);
        }
    }

    // Apply flagging heuristics
    private async applyFlaggingHeuristics(request: LeaveRequest & Document): Promise<void> {
        const heuristics = [
            await this.checkFrequentShortLeaves(request.employeeId.toString()),
            await this.checkMondayFridayPattern(request),
            await this.checkLongSickWithoutDocs(request),
        ];

        const flaggedHeuristics = heuristics.filter((h) => h.shouldFlag);

        if (flaggedHeuristics.length > 0) {
            await this.leaveRequestModel.findByIdAndUpdate(
                request._id,
                {
                    irregularPatternFlag: true,
                }
            ).exec();

            this.logger.log(`Request ${request._id} flagged for irregular pattern`);
        }
    }

    private async checkFrequentShortLeaves(employeeId: string) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const annualLeaveType = await this.leaveTypeModel.findOne({
            name: { $regex: /annual/i },
        }).exec();

        if (!annualLeaveType) {
            return { shouldFlag: false, reason: '' };
        }

        const shortLeaves = await this.leaveRequestModel.countDocuments({
            employeeId: new Types.ObjectId(employeeId),
            leaveTypeId: annualLeaveType._id,
            durationDays: { $lte: 2 },
            'dates.from': { $gte: thirtyDaysAgo },
            status: LeaveStatus.APPROVED,
        });

        return {
            shouldFlag: shortLeaves >= 3,
            reason: shortLeaves >= 3 ? `Frequent short leaves: ${shortLeaves} in 30 days` : '',
            priority: shortLeaves >= 5 ? 'HIGH' : shortLeaves >= 3 ? 'MEDIUM' : 'LOW',
        };
    }

    private async checkMondayFridayPattern(request: LeaveRequest) {
        const startDay = new Date(request.dates.from).getDay();
        const endDay = new Date(request.dates.to).getDay();

        const isMondayStart = startDay === 1;
        const isFridayEnd = endDay === 5;
        const isSingleDay = request.durationDays === 1;
        const isMondayOrFridaySingleDay = isSingleDay && (startDay === 1 || startDay === 5);

        return {
            shouldFlag: isMondayStart || isFridayEnd || isMondayOrFridaySingleDay,
            reason: isMondayStart
                ? 'Monday start pattern'
                : isFridayEnd
                ? 'Friday end pattern'
                : isMondayOrFridaySingleDay
                ? 'Single day on Monday/Friday'
                : '',
            priority: 'MEDIUM',
        };
    }

    private async checkLongSickWithoutDocs(request: LeaveRequest & Document) {
        const leaveType = await this.leaveTypeModel.findById(request.leaveTypeId).exec();
        const isSickLeave = leaveType?.name?.toLowerCase().includes('sick') ||
                           leaveType?.name?.toLowerCase().includes('medical');

        if (!isSickLeave || request.durationDays < 3) {
            return { shouldFlag: false, reason: '' };
        }

        const attachments = await this.attachmentModel.countDocuments({
            _id: { $in: request.attachments || [] },
        });

        return {
            shouldFlag: attachments === 0,
            reason: 'Long sick leave without supporting documentation',
        };
    }

    // REQ-021, REQ-025: Process review (Manager or HR)
    async processReview(
        requestId: string,
        reviewData: {
            approverId: string;
            action: 'APPROVE' | 'REJECT' | 'OVERRIDE';
            isHR: boolean;
            comments?: string;
        }
    ): Promise<LeaveRequest> {
        const request = await this.leaveRequestModel.findById(requestId).exec();

        if (!request) {
            throw new NotFoundException(`Request ${requestId} not found.`);
        }

        // Determine new status based on action and role
        let newStatus: LeaveStatus = request.status;

        if (reviewData.action === 'REJECT') {
            newStatus = LeaveStatus.REJECTED;
            request.rejectionReason = reviewData.comments || 'Rejected by approver';
        } else if (reviewData.action === 'APPROVE') {
            // If HR approves, it's final approval
            if (reviewData.isHR) {
                newStatus = LeaveStatus.APPROVED;
            } else {
                // Manager approval - still pending HR review
                newStatus = LeaveStatus.PENDING;
            }
        } else if (reviewData.action === 'OVERRIDE' && reviewData.isHR) {
            // HR can override manager's decision
            newStatus = LeaveStatus.APPROVED;
        }

        // Update approval flow
        const approvalEntry = {
            role: reviewData.isHR ? 'HR_MANAGER' : 'DEPARTMENT_HEAD',
            status: reviewData.action,
            decidedBy: new Types.ObjectId(reviewData.approverId),
            decidedAt: new Date(),
        };

        const updatedRequest = await this.leaveRequestModel.findByIdAndUpdate(
            requestId,
            {
                status: newStatus,
                $push: { approvalFlow: approvalEntry },
            },
            { new: true }
        ).exec();

        if (!updatedRequest) {
            throw new NotFoundException(`Request ${requestId} was not found for update.`);
        }

        // Trigger integration if approved (REQ-042)
        if (newStatus === LeaveStatus.APPROVED) {
            await this.finalizeIntegration(updatedRequest);
        }

        // Send notification
        await this.notificationService.sendReviewNotification(updatedRequest._id.toString());

        return updatedRequest;
    }

    // REQ-023: Delegate approval authority
    async delegateApproval(
        managerId: string,
        delegateData: {
            delegateTo: string;
            startDate: Date;
            endDate: Date;
            leaveTypeIds?: string[];
        }
    ): Promise<any> {
        // This would typically be stored in a delegation table
        // For now, we'll log it and return a success message
        this.logger.log(
            `Manager ${managerId} delegated approval authority to ${delegateData.delegateTo} ` +
            `from ${delegateData.startDate} to ${delegateData.endDate}`
        );

        return {
            managerId,
            delegateTo: delegateData.delegateTo,
            startDate: delegateData.startDate,
            endDate: delegateData.endDate,
            status: 'ACTIVE',
        };
    }

    // REQ-040: Get employee balance
    async getEmployeeBalance(employeeId: string): Promise<any> {
        const entitlements = await this.leaveEntitlementModel
            .find({ employeeId: new Types.ObjectId(employeeId), isActive: true })
            .populate('leaveTypeId')
            .exec();

        const balances = entitlements.map((ent) => ({
            leaveType: ent.leaveTypeId,
            yearlyEntitlement: ent.yearlyEntitlement,
            accrued: ent.accrued,
            carryForward: ent.carryForward,
            taken: ent.taken,
            pending: ent.pending,
            remaining: ent.remaining,
        }));

        return {
            employeeId,
            balances,
        };
    }

    // REQ-006: Create policy
    async createPolicy(policyData: any): Promise<LeavePolicy> {
        if (!policyData.payrollPayCode) {
            throw new BadRequestException('Policy must include a payroll pay code (REQ-006).');
        }

        const newPolicy = new this.leavePolicyModel(policyData);
        return newPolicy.save();
    }

    // REQ-013, BR 17: Manual adjustment with audit trail
    async manualAdjustBalance(adjustmentData: {
        employeeId: string;
        leaveTypeId: string;
        amount: number;
        reason: string;
        hrUserId: string;
    }): Promise<any> {
        const { employeeId, leaveTypeId, amount, reason, hrUserId } = adjustmentData;

        if (!reason || !hrUserId) {
            throw new BadRequestException(
                'Justification (reason) and HR User ID are required for manual adjustment (BR 17).'
            );
        }

        // Update the balance
        const updatedBalance = await this.leaveEntitlementModel.findOneAndUpdate(
            { employeeId: new Types.ObjectId(employeeId), leaveTypeId: new Types.ObjectId(leaveTypeId) },
            { $inc: { remaining: amount } },
            { new: true }
        ).exec();

        if (!updatedBalance) {
            throw new NotFoundException('Leave entitlement not found');
        }

        // Log the change for audit (BR 17)
        await this.leaveAdjustmentModel.create({
            employeeId: new Types.ObjectId(employeeId),
            leaveTypeId: new Types.ObjectId(leaveTypeId),
            amount: amount,
            reason: reason,
            adjustmentType: amount > 0 ? AdjustmentType.ADD : AdjustmentType.DEDUCT,
            hrUserId: new Types.ObjectId(hrUserId),
        });

        return updatedBalance;
    }

    // BR 55: Get irregular leave report
    async getIrregularLeaveReport(managerId: string): Promise<any> {
        const teamLeaves = await this.leaveRequestModel
            .find({
                managerId: new Types.ObjectId(managerId),
                $or: [
                    { irregularPatternFlag: true },
                    { flagged: true },
                ],
            })
            .populate('employeeId')
            .populate('leaveTypeId')
            .exec();

        return teamLeaves.map((leave) => ({
            requestId: leave._id,
            employee: leave.employeeId,
            leaveType: leave.leaveTypeId,
            dates: leave.dates,
            duration: leave.durationDays,
            flagReason: leave.flagReason,
            flagPriority: leave.flagPriority,
        }));
    }

    // OFF-013, BR 53: Process final settlement
    async processFinalSettlement(employeeId: string, dailySalaryRate: number): Promise<any> {
        const annualLeaveType = await this.leaveTypeModel.findOne({
            name: { $regex: /annual/i },
        }).exec();

        if (!annualLeaveType) {
            throw new NotFoundException('Annual leave type not found');
        }

        const MAX_ENCASH_DAYS = 30; // Capped at 30 days (BR 53)

        const entitlement = await this.leaveEntitlementModel.findOne({
            employeeId: new Types.ObjectId(employeeId),
            leaveTypeId: annualLeaveType._id,
        }).exec();

        if (!entitlement) {
            throw new NotFoundException(`Annual leave entitlement not found for employee ${employeeId}.`);
        }

        const unusedDays = Math.min(entitlement.remaining, MAX_ENCASH_DAYS);
        const encashmentAmount = dailySalaryRate * unusedDays;

        // Trigger payroll payment (would need proper integration)
        try {
            if (this.payrollExecutionService && typeof (this.payrollExecutionService as any).processFinalPayment === 'function') {
                await (this.payrollExecutionService as any).processFinalPayment({
                    employeeId,
                    encashmentAmount,
                });
            }
        } catch (error) {
            this.logger.warn(`Payroll integration failed: ${error.message}`);
        }

        return { unusedDays, encashmentAmount };
    }

    // Finalize integration with Payroll and Time Management
    private async finalizeIntegration(request: LeaveRequest & Document): Promise<void> {
        try {
            // 1. Update Balances
            await this.leaveEntitlementModel.findOneAndUpdate(
                { employeeId: request.employeeId, leaveTypeId: request.leaveTypeId },
                {
                    $inc: {
                        taken: request.durationDays,
                        remaining: -request.durationDays,
                        pending: -request.durationDays,
                    },
                }
            ).exec();

            // 2. Payroll Sync (REQ-042)
            try {
                const policy = await this.leavePolicyModel.findOne({
                    leaveTypeId: request.leaveTypeId,
                }).exec();

                if (this.payrollExecutionService && typeof (this.payrollExecutionService as any).applyLeaveAdjustment === 'function') {
                    await (this.payrollExecutionService as any).applyLeaveAdjustment({
                        employeeId: request.employeeId.toString(),
                        leaveRequestId: request._id.toString(),
                        leaveType: await this.getLeaveTypeName(request.leaveTypeId),
                        duration: request.durationDays,
                        startDate: request.dates.from,
                        endDate: request.dates.to,
                        payrollCode: policy?.payrollPayCode || 'LEAVE_UNKNOWN',
                    });
                }
            } catch (error) {
                this.logger.warn(`Payroll sync failed: ${error.message}`);
            }

            // 3. Time Management Sync (REQ-042)
            try {
                if (this.timeManagementService && typeof (this.timeManagementService as any).blockLeavePeriod === 'function') {
                    await (this.timeManagementService as any).blockLeavePeriod({
                        employeeId: request.employeeId.toString(),
                        leaveRequestId: request._id.toString(),
                        startDate: request.dates.from,
                        endDate: request.dates.to,
                        leaveType: await this.getLeaveTypeName(request.leaveTypeId),
                    });
                }
            } catch (error) {
                this.logger.warn(`Time management sync failed: ${error.message}`);
            }

            // 4. Mark as synced
            await this.leaveRequestModel.findByIdAndUpdate(
                request._id,
                { isSynced: true, syncedAt: new Date() }
            ).exec();
        } catch (error) {
            this.logger.error(`Integration failed for request ${request._id}:`, error);
            throw error;
        }
    }

    // Helper methods
    private async getLeaveTypeName(leaveTypeId: Types.ObjectId): Promise<string> {
        const leaveType = await this.leaveTypeModel.findById(leaveTypeId).exec();
        return leaveType?.name || 'UNKNOWN';
    }

    // Cancel request
    async cancelRequest(requestId: string, employeeId: string): Promise<LeaveRequest> {
        const request = await this.leaveRequestModel.findById(requestId).exec();

        if (!request) {
            throw new NotFoundException(`Leave request ${requestId} not found`);
        }

        if (request.employeeId.toString() !== employeeId) {
            throw new BadRequestException('You cannot cancel another employee\'s leave request');
        }

        if (request.status !== LeaveStatus.PENDING) {
            throw new BadRequestException('Only PENDING requests can be cancelled');
        }

        request.status = LeaveStatus.CANCELLED;
        request.approvalFlow.push({
            role: 'EMPLOYEE',
            status: 'CANCELLED',
            decidedBy: new Types.ObjectId(employeeId),
            decidedAt: new Date(),
        });

        await request.save();

        await this.notificationService.sendCancellationNotification(request._id.toString());

        return request;
    }

    // REQ-027: Bulk review
    async bulkReview(bulkReviewData: {
        requestIds: string[];
        approverId: string;
        action: 'APPROVE' | 'REJECT';
        isHR: boolean;
        comments?: string;
    }): Promise<{ results: Array<{ requestId: string; status: string; result?: any; error?: string }> }> {
        const results: Array<{ requestId: string; status: string; result?: any; error?: string }> = [];

        for (const requestId of bulkReviewData.requestIds) {
            try {
                const result = await this.processReview(requestId, {
                    approverId: bulkReviewData.approverId,
                    action: bulkReviewData.action,
                    isHR: bulkReviewData.isHR,
                    comments: bulkReviewData.comments,
                });
                results.push({
                    requestId,
                    status: 'SUCCESS',
                    result,
                });
            } catch (error: any) {
                results.push({
                    requestId,
                    status: 'FAILED',
                    error: error.message,
                });
            }
        }

        return { results };
    }

    // Get requests with filters
    async getRequests(filters: any): Promise<LeaveRequest[]> {
        const query: any = {};

        if (filters.employeeId) query.employeeId = new Types.ObjectId(filters.employeeId);
        if (filters.status) query.status = filters.status;
        if (filters.leaveTypeId) query.leaveTypeId = new Types.ObjectId(filters.leaveTypeId);
        if (filters.managerId) query.managerId = new Types.ObjectId(filters.managerId);

        if (filters.from || filters.to) {
            query['dates.from'] = {};
            if (filters.from) query['dates.from'].$gte = new Date(filters.from);
            if (filters.to) query['dates.to'].$lte = new Date(filters.to);
        }

        return this.leaveRequestModel.find(query).sort({ createdAt: -1 }).exec();
    }

    // Get team leaves
    async getTeamLeaves(managerId: string, filters: any): Promise<LeaveRequest[]> {
        const query: any = { managerId: new Types.ObjectId(managerId) };

        if (filters.leaveTypeId) query.leaveTypeId = new Types.ObjectId(filters.leaveTypeId);
        if (filters.status) query.status = filters.status;
        if (filters.from || filters.to) {
            query['dates.from'] = {};
            if (filters.from) query['dates.from'].$gte = new Date(filters.from);
            if (filters.to) query['dates.to'].$lte = new Date(filters.to);
        }

        return this.leaveRequestModel.find(query).exec();
    }

    // REQ-016: Add attachment
    async addAttachment(
        requestId: string,
        attachmentData: {
            fileUrl: string;
            fileName: string;
            fileType: string;
            uploadedBy: string;
            documentType?: string;
        }
    ): Promise<Attachment> {
        const leaveRequest = await this.leaveRequestModel.findById(requestId).exec();
        if (!leaveRequest) {
            throw new NotFoundException(`Leave request ${requestId} not found`);
        }

        const allowedTypes = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
        const fileExt = attachmentData.fileType.toLowerCase();
        if (!allowedTypes.includes(fileExt)) {
            throw new BadRequestException(
                `File type ${attachmentData.fileType} not allowed. Allowed: ${allowedTypes.join(', ')}`
            );
        }

        const attachment = new this.attachmentModel({
            originalName: attachmentData.fileName,
            filePath: attachmentData.fileUrl,
            fileType: attachmentData.fileType,
        });

        const savedAttachment = await attachment.save();

        await this.leaveRequestModel.findByIdAndUpdate(
            requestId,
            {
                $push: { attachments: savedAttachment._id },
                hasAttachments: true,
            }
        ).exec();

        this.logger.log(`Attachment added to leave request ${requestId} by user ${attachmentData.uploadedBy}`);

        return savedAttachment;
    }

    // REQ-028: Verify medical documents
    async verifyMedicalDocuments(
        requestId: string,
        verificationData: {
            verifiedBy: string;
            isValid: boolean;
            comments?: string;
        }
    ): Promise<LeaveRequest> {
        const request = await this.leaveRequestModel.findById(requestId).exec();

        if (!request) {
            throw new NotFoundException(`Leave request ${requestId} not found`);
        }

        const isMedicalLeave = await this.isMedicalLeaveType(request.leaveTypeId);
        if (!isMedicalLeave) {
            throw new BadRequestException('Medical verification can only be performed on medical leave types');
        }

        request.medicalVerified = verificationData.isValid;
        request.medicalVerifiedBy = new Types.ObjectId(verificationData.verifiedBy);
        request.medicalVerifiedAt = new Date();
        request.medicalVerificationComments = verificationData.comments;

        if (!verificationData.isValid) {
            request.status = LeaveStatus.REJECTED;
            request.rejectionReason = `Medical documentation invalid: ${verificationData.comments}`;
        }

        const updatedRequest = await request.save();

        await this.notificationService.sendMedicalVerificationNotification(
            request.employeeId.toString(),
            verificationData.isValid ? 'APPROVED' : 'REJECTED',
            requestId
        );

        this.logger.log(
            `Medical documents for request ${requestId} verified as ${verificationData.isValid ? 'VALID' : 'INVALID'}`
        );

        return updatedRequest;
    }

    private async isMedicalLeaveType(leaveTypeId: Types.ObjectId): Promise<boolean> {
        const leaveType = await this.leaveTypeModel.findById(leaveTypeId).populate('categoryId').exec();

        if (!leaveType) {
            return false;
        }

        const category = leaveType.categoryId as any;
        const categoryName = category?.name?.toLowerCase() || '';
        const leaveTypeName = leaveType.name?.toLowerCase() || '';

        return (
            categoryName.includes('medical') ||
            leaveTypeName.includes('sick') ||
            leaveTypeName.includes('medical')
        );
    }

    // REQ-039: Flag leave request
    async flagLeaveRequest(
        requestId: string,
        flagData: {
            flaggedBy: string;
            reason: string;
            priority: 'LOW' | 'MEDIUM' | 'HIGH';
        }
    ): Promise<LeaveRequest> {
        const request = await this.leaveRequestModel.findById(requestId).exec();

        if (!request) {
            throw new NotFoundException(`Leave request ${requestId} not found`);
        }

        request.flagged = true;
        request.flagReason = flagData.reason;
        request.flagPriority = flagData.priority;
        request.flaggedBy = new Types.ObjectId(flagData.flaggedBy);
        request.flaggedAt = new Date();

        await this.applyFlaggingHeuristics(request);

        return await request.save();
    }

    async getRequestById(requestId: string): Promise<LeaveRequest> {
        const request = await this.leaveRequestModel.findById(requestId).exec();
        if (!request) {
            throw new NotFoundException(`Leave request ${requestId} not found`);
        }
        return request;
    }

    // REQ-040: Accrual process (BR 11: pause during unpaid leave)
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async applyAccrualForAll(): Promise<void> {
        this.logger.log('🔄 Running nightly accrual process...');

        try {
            const activeEntitlements = await this.leaveEntitlementModel.find({ isActive: true }).exec();
            let processedCount = 0;
            let errorCount = 0;

            for (const entitlement of activeEntitlements) {
                try {
                    // BR 11: Check if employee is eligible (not on unpaid leave/suspension)
                    const isEligible = await this.isEmployeeEligibleForAccrual(entitlement.employeeId);

                    if (isEligible) {
                        const policy = await this.leavePolicyModel.findOne({
                            leaveTypeId: entitlement.leaveTypeId,
                        }).exec();

                        if (policy?.isActive) {
                            let accrualAmount = 0;

                            switch (policy.accrualMethod) {
                                case AccrualMethod.MONTHLY:
                                    accrualAmount = policy.monthlyRate || 0;
                                    break;
                                case AccrualMethod.YEARLY:
                                    accrualAmount = (policy.yearlyRate || 0) / 12;
                                    break;
                                case AccrualMethod.QUARTERLY:
                                    accrualAmount = (policy.yearlyRate || 0) / 4;
                                    break;
                                default:
                                    accrualAmount = 0;
                            }

                            if (accrualAmount > 0) {
                                const oldBalance = entitlement.remaining;
                                entitlement.accrued += accrualAmount;
                                entitlement.accruedActual += accrualAmount;
                                entitlement.remaining += accrualAmount;
                                entitlement.lastAccrualDate = new Date();
                                await entitlement.save();

                                processedCount++;
                                this.logger.debug(
                                    `Accrued ${accrualAmount} days for employee ${entitlement.employeeId}. ` +
                                    `Balance: ${oldBalance} → ${entitlement.remaining}`
                                );
                            }
                        }
                    }
                } catch (error) {
                    errorCount++;
                    this.logger.error(`Accrual failed for entitlement ${entitlement._id}:`, error);
                }
            }

            this.logger.log(`✅ Nightly accrual completed. Processed: ${processedCount}, Errors: ${errorCount}`);
        } catch (error) {
            this.logger.error('❌ Nightly accrual process failed:', error);
        }
    }

    // REQ-041: Year-end processing with carry-forward
    @Cron('0 0 1 1 *') // Run on January 1st every year at midnight
    async applyCarryForward(): Promise<void> {
        this.logger.log('🔄 Running yearly carry-forward process...');

        try {
            const entitlements = await this.leaveEntitlementModel.find({ isActive: true }).exec();
            let processedCount = 0;
            let expiredCount = 0;
            let totalExpiredDays = 0;
            let totalCarriedOver = 0;

            for (const entitlement of entitlements) {
                try {
                    const policy = await this.leavePolicyModel.findOne({
                        leaveTypeId: entitlement.leaveTypeId,
                    }).exec();

                    if (policy?.carryForwardAllowed && policy?.maxCarryForward && policy.isActive) {
                        const carryOver = Math.min(entitlement.remaining, policy.maxCarryForward);
                        const expiredDays = entitlement.remaining - carryOver;

                        // Store previous year data for audit
                        entitlement.previousYearBalance = entitlement.remaining;
                        entitlement.carriedOver = carryOver;
                        entitlement.carryForward = carryOver;
                        entitlement.remaining = carryOver;
                        entitlement.lastCarryForwardDate = new Date();
                        entitlement.fiscalYear = new Date().getFullYear();

                        // Reset counters for new year (but keep accrued for reporting)
                        const previousTaken = entitlement.taken;
                        const previousPending = entitlement.pending;
                        entitlement.taken = 0;
                        entitlement.pending = 0;

                        await entitlement.save();
                        processedCount++;

                        if (expiredDays > 0) {
                            expiredCount++;
                            totalExpiredDays += expiredDays;
                        }
                        totalCarriedOver += carryOver;

                        this.logger.debug(
                            `Carry-forward for ${entitlement.employeeId}: ${carryOver} days carried over, ` +
                            `${expiredDays} days expired. Previous: taken=${previousTaken}, pending=${previousPending}`
                        );

                        // Log adjustment for audit trail
                        if (expiredDays > 0) {
                            await this.leaveAdjustmentModel.create({
                                employeeId: entitlement.employeeId,
                                leaveTypeId: entitlement.leaveTypeId,
                                amount: -expiredDays,
                                reason: `Year-end expiry: ${expiredDays} days expired (exceeded max carry-forward of ${policy.maxCarryForward})`,
                                adjustmentType: AdjustmentType.DEDUCT,
                                hrUserId: new Types.ObjectId('000000000000000000000000'), // System user
                            });
                        }
                    } else if (!policy?.carryForwardAllowed) {
                        // No carry-forward allowed - all remaining days expire
                        const expiredDays = entitlement.remaining;
                        if (expiredDays > 0) {
                            entitlement.previousYearBalance = entitlement.remaining;
                            entitlement.remaining = 0;
                            entitlement.taken = 0;
                            entitlement.pending = 0;
                            entitlement.fiscalYear = new Date().getFullYear();
                            await entitlement.save();

                            expiredCount++;
                            totalExpiredDays += expiredDays;

                            // Log adjustment
                            await this.leaveAdjustmentModel.create({
                                employeeId: entitlement.employeeId,
                                leaveTypeId: entitlement.leaveTypeId,
                                amount: -expiredDays,
                                reason: `Year-end expiry: ${expiredDays} days expired (carry-forward not allowed for this leave type)`,
                                adjustmentType: AdjustmentType.DEDUCT,
                                hrUserId: new Types.ObjectId('000000000000000000000000'), // System user
                            });
                        }
                    }
                } catch (error) {
                    this.logger.error(`Carry-forward failed for entitlement ${entitlement._id}:`, error);
                }
            }

            this.logger.log(
                `✅ Yearly carry-forward completed. Processed: ${processedCount} entitlements, ` +
                `Expired: ${expiredCount} (${totalExpiredDays} days), Carried over: ${totalCarriedOver} days`
            );
        } catch (error) {
            this.logger.error('❌ Yearly carry-forward process failed:', error);
        }
    }

    // Auto-escalate pending requests (BR 28)
    @Cron(CronExpression.EVERY_HOUR)
    async autoEscalatePendingRequests(): Promise<void> {
        this.logger.log('🔄 Auto-escalating pending requests...');

        try {
            const fortyEightHoursAgo = new Date();
            fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

            const pendingRequests = await this.leaveRequestModel.find({
                status: LeaveStatus.PENDING,
                createdAt: { $lte: fortyEightHoursAgo },
                isEscalated: { $ne: true },
            }).exec();

            let escalatedCount = 0;

            for (const request of pendingRequests) {
                try {
                    request.status = LeaveStatus.ESCALATED;
                    request.isEscalated = true;
                    request.escalatedAt = new Date();
                    await request.save();

                    await this.notificationService.sendEscalationNotification(
                        request._id.toString(),
                        request.managerId?.toString()
                    );

                    escalatedCount++;
                    this.logger.debug(`Escalated request ${request._id} due to 48-hour timeout`);
                } catch (error) {
                    this.logger.error(`Escalation failed for request ${request._id}:`, error);
                }
            }

            this.logger.log(`✅ Auto-escalation completed. Escalated ${escalatedCount} requests`);
        } catch (error) {
            this.logger.error('❌ Auto-escalation process failed:', error);
        }
    }

    // Helper method for accrual eligibility (BR 11)
    private async isEmployeeEligibleForAccrual(employeeId: Types.ObjectId): Promise<boolean> {
        try {
            // Check if employee is on unpaid leave
            const unpaidLeaveType = await this.leaveTypeModel.findOne({
                name: { $regex: /unpaid/i },
            }).exec();

            if (unpaidLeaveType) {
                const activeUnpaidLeave = await this.leaveRequestModel.findOne({
                    employeeId,
                    leaveTypeId: unpaidLeaveType._id,
                    status: LeaveStatus.APPROVED,
                    'dates.from': { $lte: new Date() },
                    'dates.to': { $gte: new Date() },
                }).exec();

                if (activeUnpaidLeave) {
                    this.logger.debug(`Employee ${employeeId} is on unpaid leave - accrual paused`);
                    return false;
                }
            }

            // Check employee profile status
            const employeeProfile = await this.getEmployeeProfile(employeeId.toString());
            if (employeeProfile) {
                // Pause accrual if employee is suspended, terminated, or on unpaid leave
                const inactiveStatuses = ['SUSPENDED', 'TERMINATED', 'INACTIVE'];
                if (inactiveStatuses.includes(employeeProfile.status?.toUpperCase())) {
                    return false;
                }
            }

            return true;
        } catch (error) {
            this.logger.warn(`Could not check employee eligibility: ${error.message}`);
            return true; // Default to eligible if check fails
        }
    }

    // Encash leave
    async encashLeave(encashData: {
        requestId: string;
        dailySalaryRate: number;
        employeeId?: string;
        days?: number;
        reason?: string;
    }): Promise<any> {
        const { requestId, dailySalaryRate } = encashData;

        const request = await this.leaveRequestModel.findById(requestId).exec();
        if (!request) {
            throw new NotFoundException(`Leave request ${requestId} not found`);
        }

        if (request.status !== LeaveStatus.APPROVED) {
            throw new BadRequestException('Only approved leave requests can be encashed');
        }

        const annualLeaveType = await this.leaveTypeModel.findOne({
            name: { $regex: /annual/i },
        }).exec();

        if (!annualLeaveType || request.leaveTypeId.toString() !== annualLeaveType._id.toString()) {
            throw new BadRequestException('Only annual leave can be encashed');
        }

        const entitlement = await this.leaveEntitlementModel.findOne({
            employeeId: request.employeeId,
            leaveTypeId: request.leaveTypeId,
        }).exec();

        if (!entitlement) {
            throw new NotFoundException(`Leave entitlement not found for employee ${request.employeeId}`);
        }

        const MAX_ENCASH_DAYS = 30;
        const encashableDays = Math.min(entitlement.remaining, MAX_ENCASH_DAYS);

        if (encashableDays <= 0) {
            throw new BadRequestException('No leave days available for encashment');
        }

        const encashmentAmount = dailySalaryRate * encashableDays;

        entitlement.remaining -= encashableDays;
        await entitlement.save();

        try {
            if (this.payrollExecutionService && typeof (this.payrollExecutionService as any).processFinalPayment === 'function') {
                await (this.payrollExecutionService as any).processFinalPayment({
                    employeeId: request.employeeId.toString(),
                    encashmentAmount,
                });
            }
        } catch (error) {
            this.logger.warn(`Payroll integration failed: ${error.message}`);
        }

        request.status = LeaveStatus.ENCASHED;
        await request.save();

        this.logger.log(
            `Leave request ${requestId} encashed for ${encashableDays} days, amount ${encashmentAmount}`
        );

        return {
            requestId,
            encashableDays,
            encashmentAmount,
        };
    }

    // BR 19: Retroactive leave deduction
    async applyRetroactiveDeduction(deductionData: {
        employeeId: string;
        leaveTypeId: string;
        dates: { from: Date; to: Date };
        reason: string;
        hrUserId: string;
    }): Promise<any> {
        const { employeeId, leaveTypeId, dates, reason, hrUserId } = deductionData;

        // Calculate working days
        const durationDays = await this.calculateWorkingDays(dates.from, dates.to);

        // Get entitlement
        const entitlement = await this.leaveEntitlementModel.findOne({
            employeeId: new Types.ObjectId(employeeId),
            leaveTypeId: new Types.ObjectId(leaveTypeId),
        }).exec();

        if (!entitlement) {
            throw new NotFoundException('Leave entitlement not found');
        }

        // Check if sufficient balance
        if (entitlement.remaining < durationDays) {
            throw new BadRequestException(
                `Insufficient balance. Available: ${entitlement.remaining}, Required: ${durationDays}`
            );
        }

        // Update balance
        entitlement.taken += durationDays;
        entitlement.remaining -= durationDays;
        await entitlement.save();

        // Log adjustment for audit trail
        await this.leaveAdjustmentModel.create({
            employeeId: new Types.ObjectId(employeeId),
            leaveTypeId: new Types.ObjectId(leaveTypeId),
            amount: -durationDays,
            reason: `Retroactive deduction: ${reason}`,
            adjustmentType: AdjustmentType.DEDUCT,
            hrUserId: new Types.ObjectId(hrUserId),
        });

        this.logger.log(
            `Retroactive deduction applied: ${durationDays} days for employee ${employeeId}. Reason: ${reason}`
        );

        return {
            employeeId,
            leaveTypeId,
            durationDays,
            newBalance: entitlement.remaining,
        };
    }

    // Enhanced reporting: Get leave history for employee
    async getLeaveHistory(employeeId: string, filters?: {
        leaveTypeId?: string;
        from?: Date;
        to?: Date;
        status?: LeaveStatus;
    }): Promise<any> {
        const query: any = { employeeId: new Types.ObjectId(employeeId) };

        if (filters?.leaveTypeId) {
            query.leaveTypeId = new Types.ObjectId(filters.leaveTypeId);
        }
        if (filters?.status) {
            query.status = filters.status;
        }
        if (filters?.from || filters?.to) {
            query['dates.from'] = {};
            if (filters.from) query['dates.from'].$gte = new Date(filters.from);
            if (filters.to) query['dates.to'].$lte = new Date(filters.to);
        }

        const requests = await this.leaveRequestModel
            .find(query)
            .populate('leaveTypeId')
            .sort({ 'dates.from': -1 })
            .exec();

        return requests.map((req) => ({
            requestId: req._id,
            leaveType: req.leaveTypeId,
            dates: req.dates,
            duration: req.durationDays,
            status: req.status,
            createdAt: (req as any).createdAt,
            approvalFlow: req.approvalFlow,
        }));
    }

    // Enhanced reporting: Get adjustment history
    async getAdjustmentHistory(employeeId: string, leaveTypeId?: string): Promise<any> {
        const query: any = { employeeId: new Types.ObjectId(employeeId) };

        if (leaveTypeId) {
            query.leaveTypeId = new Types.ObjectId(leaveTypeId);
        }

        const adjustments = await this.leaveAdjustmentModel
            .find(query)
            .populate('leaveTypeId')
            .populate('hrUserId')
            .sort({ createdAt: -1 })
            .exec();

        return adjustments.map((adj) => ({
            adjustmentId: adj._id,
            leaveType: adj.leaveTypeId,
            adjustmentType: adj.adjustmentType,
            amount: adj.amount,
            reason: adj.reason,
            hrUser: adj.hrUserId,
            createdAt: (adj as any).createdAt,
        }));
    }

    // Enhanced reporting: Get accrual history
    async getAccrualHistory(employeeId: string, leaveTypeId?: string): Promise<any> {
        const query: any = { employeeId: new Types.ObjectId(employeeId) };

        if (leaveTypeId) {
            query.leaveTypeId = new Types.ObjectId(leaveTypeId);
        }

        const entitlements = await this.leaveEntitlementModel
            .find(query)
            .populate('leaveTypeId')
            .exec();

        return entitlements.map((ent) => ({
            leaveType: ent.leaveTypeId,
            yearlyEntitlement: ent.yearlyEntitlement,
            accrued: ent.accrued,
            accruedActual: ent.accruedActual,
            carryForward: ent.carryForward,
            taken: ent.taken,
            pending: ent.pending,
            remaining: ent.remaining,
            lastAccrualDate: ent.lastAccrualDate,
            lastCarryForwardDate: ent.lastCarryForwardDate,
            fiscalYear: ent.fiscalYear,
        }));
    }

    // Enhanced reporting: Get leave statistics
    async getLeaveStatistics(filters?: {
        employeeId?: string;
        managerId?: string;
        departmentId?: string;
        from?: Date;
        to?: Date;
    }): Promise<any> {
        const query: any = {};

        if (filters?.employeeId) {
            query.employeeId = new Types.ObjectId(filters.employeeId);
        }
        if (filters?.managerId) {
            query.managerId = new Types.ObjectId(filters.managerId);
        }
        if (filters?.from || filters?.to) {
            query['dates.from'] = {};
            if (filters.from) query['dates.from'].$gte = new Date(filters.from);
            if (filters.to) query['dates.to'].$lte = new Date(filters.to);
        }

        const requests = await this.leaveRequestModel.find(query).populate('leaveTypeId').exec();

        const stats = {
            totalRequests: requests.length,
            byStatus: {} as Record<string, number>,
            byLeaveType: {} as Record<string, number>,
            totalDays: 0,
            averageDuration: 0,
            pendingCount: 0,
            approvedCount: 0,
            rejectedCount: 0,
        };

        requests.forEach((req) => {
            // Status counts
            stats.byStatus[req.status] = (stats.byStatus[req.status] || 0) + 1;
            if (req.status === LeaveStatus.PENDING) stats.pendingCount++;
            if (req.status === LeaveStatus.APPROVED) stats.approvedCount++;
            if (req.status === LeaveStatus.REJECTED) stats.rejectedCount++;

            // Leave type counts
            const leaveTypeName = (req.leaveTypeId as any)?.name || 'Unknown';
            stats.byLeaveType[leaveTypeName] = (stats.byLeaveType[leaveTypeName] || 0) + 1;

            // Total days
            if (req.status === LeaveStatus.APPROVED) {
                stats.totalDays += req.durationDays;
            }
        });

        stats.averageDuration = stats.approvedCount > 0 ? stats.totalDays / stats.approvedCount : 0;

        return stats;
    }

    // Enhanced monitoring: Get employees with low leave balance
    async getLowBalanceEmployees(threshold: number = 5): Promise<any> {
        const entitlements = await this.leaveEntitlementModel
            .find({
                isActive: true,
                remaining: { $lte: threshold },
            })
            .populate('employeeId')
            .populate('leaveTypeId')
            .exec();

        return entitlements.map((ent) => ({
            employee: ent.employeeId,
            leaveType: ent.leaveTypeId,
            remaining: ent.remaining,
            taken: ent.taken,
            yearlyEntitlement: ent.yearlyEntitlement,
        }));
    }

    // Enhanced monitoring: Get employees with excessive leave usage
    async getExcessiveUsageEmployees(threshold: number = 0.8): Promise<any> {
        const entitlements = await this.leaveEntitlementModel
            .find({ isActive: true })
            .populate('employeeId')
            .populate('leaveTypeId')
            .exec();

        const excessive = entitlements.filter((ent) => {
            if (ent.yearlyEntitlement === 0) return false;
            const usageRatio = ent.taken / ent.yearlyEntitlement;
            return usageRatio >= threshold;
        });

        return excessive.map((ent) => ({
            employee: ent.employeeId,
            leaveType: ent.leaveTypeId,
            taken: ent.taken,
            yearlyEntitlement: ent.yearlyEntitlement,
            usageRatio: (ent.taken / ent.yearlyEntitlement) * 100,
            remaining: ent.remaining,
        }));
    }

    // Helper methods for employee profile (would need proper implementation)
    private async getEmployeeProfile(employeeId: string): Promise<any> {
        try {
            // This would call the actual EmployeeProfileService
            // For now, return a placeholder
            return { status: 'ACTIVE' };
        } catch (error) {
            this.logger.warn(`Could not get employee profile: ${error.message}`);
            return null;
        }
    }

    private async getTeamMembers(managerId: string): Promise<any[]> {
        try {
            // This would call the actual EmployeeProfileService
            // For now, return empty array
            return [];
        } catch (error) {
            this.logger.warn(`Could not get team members: ${error.message}`);
            return [];
        }
    }
}
