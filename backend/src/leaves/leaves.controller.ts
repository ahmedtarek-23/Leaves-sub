import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    UsePipes,
    ValidationPipe,
    Query,
} from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto';
import { ReviewLeaveRequestDto } from './dto/review-leave-request.dto';
import { AdjustLeaveBalanceDto } from './dto/adjust-leave-balance.dto';
import { AddAttachmentDto } from './dto/add-attachment.dto';
import { VerifyMedicalDto } from './dto/verify-medical.dto';
import { FlagLeaveRequestDto } from './dto/flag-leave-request.dto';
import { DelegateApprovalDto } from './dto/delegate-approval.dto';
import { EncashLeaveDto } from './dto/encash-leave.dto';
import { BulkReviewDto } from './dto/bulk-review.dto';
import { RetroactiveDeductionDto } from './dto/retroactive-deduction.dto';

@Controller('leaves')
export class LeavesController {
    constructor(private readonly leavesService: LeavesService) {}

    // --- 1. Employee Self-Service & Submission ---

    /**
     * POST /leaves/request
     * Handles submission of a new leave request (REQ-015).
     */
    @Post('request')
    @UsePipes(new ValidationPipe({ transform: true }))
    async submitRequest(@Body() createRequestDto: CreateLeaveRequestDto) {
        return this.leavesService.submitRequest(createRequestDto);
    }

    /**
     * GET /leaves/balances/:employeeId
     * Retrieves the current leave balances for an employee (Accrued, Taken, Remaining) (REQ-040).
     */
    @Get('balances/:employeeId')
    async getEmployeeBalance(@Param('employeeId') employeeId: string) {
        return this.leavesService.getEmployeeBalance(employeeId);
    }

    /**
     * GET /leaves/request
     * Get leave requests with optional filters
     */
    @Get('request')
    async getRequests(@Query() query: any) {
        return this.leavesService.getRequests(query);
    }

    /**
     * GET /leaves/request/:id
     * Get a specific leave request by ID
     */
    @Get('request/:id')
    async getRequestById(@Param('id') requestId: string) {
        return this.leavesService.getRequestById(requestId);
    }

    /**
     * GET /leaves/team/:managerId
     * Get team leaves for a manager (REQ-035)
     */
    @Get('team/:managerId')
    async getTeamLeaves(@Param('managerId') managerId: string, @Query() filters: any) {
        return this.leavesService.getTeamLeaves(managerId, filters);
    }

    // --- 2. Approval Workflow ---

    /**
     * PUT /leaves/request/:id/review
     * Handles the multi-level approval chain: Manager (REQ-021) or HR Admin (REQ-025).
     */
    @Put('request/:id/review')
    @UsePipes(new ValidationPipe({ transform: true }))
    async reviewRequest(@Param('id') requestId: string, @Body() reviewData: ReviewLeaveRequestDto) {
        return this.leavesService.processReview(requestId, reviewData);
    }

    /**
     * POST /leaves/bulk-review
     * Bulk review for multiple requests (REQ-027)
     */
    @Post('bulk-review')
    @UsePipes(new ValidationPipe({ transform: true }))
    async bulkReview(@Body() bulkReviewData: BulkReviewDto) {
        return this.leavesService.bulkReview(bulkReviewData);
    }

    /**
     * PUT /leaves/request/:id/cancel
     * Cancel a pending leave request
     */
    @Put('request/:id/cancel')
    async cancelRequest(@Param('id') requestId: string, @Body() data: { employeeId: string }) {
        return this.leavesService.cancelRequest(requestId, data.employeeId);
    }

    /**
     * POST /leaves/delegate/:managerId
     * Delegate approval authority (REQ-023)
     */
    @Post('delegate/:managerId')
    @UsePipes(new ValidationPipe({ transform: true }))
    async delegateApproval(
        @Param('managerId') managerId: string,
        @Body() delegateData: DelegateApprovalDto
    ) {
        return this.leavesService.delegateApproval(managerId, delegateData);
    }

    // --- 3. Attachments & Documents ---

    /**
     * POST /leaves/request/:id/attachments
     * Add attachment to leave request (REQ-016)
     */
    @Post('request/:id/attachments')
    @UsePipes(new ValidationPipe({ transform: true }))
    async addAttachment(@Param('id') requestId: string, @Body() attachmentData: AddAttachmentDto) {
        return this.leavesService.addAttachment(requestId, attachmentData);
    }

    /**
     * PUT /leaves/request/:id/verify-medical
     * Verify medical documents (REQ-028)
     */
    @Put('request/:id/verify-medical')
    @UsePipes(new ValidationPipe({ transform: true }))
    async verifyMedicalDocuments(
        @Param('id') requestId: string,
        @Body() verificationData: VerifyMedicalDto
    ) {
        return this.leavesService.verifyMedicalDocuments(requestId, verificationData);
    }

    // --- 4. Flagging & Monitoring ---

    /**
     * PUT /leaves/request/:id/flag
     * Flag leave request for review (REQ-039)
     */
    @Put('request/:id/flag')
    @UsePipes(new ValidationPipe({ transform: true }))
    async flagLeaveRequest(@Param('id') requestId: string, @Body() flagData: FlagLeaveRequestDto) {
        return this.leavesService.flagLeaveRequest(requestId, flagData);
    }

    /**
     * GET /leaves/reports/irregular
     * Managers monitor and flag irregular leave patterns (BR 55).
     */
    @Get('reports/irregular')
    async getIrregularLeaveReport(@Query('managerId') managerId: string) {
        return this.leavesService.getIrregularLeaveReport(managerId);
    }

    // --- 5. HR/System Admin Configuration ---

    /**
     * POST /leaves/policies
     * Creates a new standardized leave policy (e.g., Annual, Sick). (REQ-006)
     */
    @Post('policies')
    @UsePipes(new ValidationPipe({ transform: true }))
    async createPolicy(@Body() policyData: CreateLeavePolicyDto) {
        return this.leavesService.createPolicy(policyData);
    }

    /**
     * PUT /leaves/balances/adjust
     * Allows HR Admin to perform manual adjustments (e.g., for audit findings, bulk updates). (REQ-013)
     */
    @Put('balances/adjust')
    @UsePipes(new ValidationPipe({ transform: true }))
    async adjustBalance(@Body() adjustmentData: AdjustLeaveBalanceDto) {
        return this.leavesService.manualAdjustBalance(adjustmentData);
    }

    // --- 6. Encashment & Settlement ---

    /**
     * POST /leaves/encash/:id
     * Encash leave for a specific request (BR 53)
     */
    @Post('encash/:id')
    @UsePipes(new ValidationPipe({ transform: true }))
    async encashLeave(@Param('id') requestId: string, @Body() encashData: EncashLeaveDto) {
        return this.leavesService.encashLeave({
            requestId,
            ...encashData,
        });
    }

    /**
     * POST /leaves/settlement/:employeeId
     * Process final settlement for offboarding (OFF-013, BR 53)
     */
    @Post('settlement/:employeeId')
    async processFinalSettlement(
        @Param('employeeId') employeeId: string,
        @Body() data: { dailySalaryRate: number }
    ) {
        return this.leavesService.processFinalSettlement(employeeId, data.dailySalaryRate);
    }

    // --- Phase 3: Enhanced Tracking, Monitoring, and Auditing ---

    /**
     * POST /leaves/retroactive-deduction
     * Apply retroactive leave deduction (BR 19)
     */
    @Post('retroactive-deduction')
    @UsePipes(new ValidationPipe({ transform: true }))
    async applyRetroactiveDeduction(@Body() deductionData: RetroactiveDeductionDto) {
        return this.leavesService.applyRetroactiveDeduction(deductionData);
    }

    /**
     * GET /leaves/history/:employeeId
     * Get leave history for an employee
     */
    @Get('history/:employeeId')
    async getLeaveHistory(
        @Param('employeeId') employeeId: string,
        @Query() filters: {
            leaveTypeId?: string;
            from?: string;
            to?: string;
            status?: string;
        }
    ) {
        return this.leavesService.getLeaveHistory(employeeId, {
            leaveTypeId: filters.leaveTypeId,
            from: filters.from ? new Date(filters.from) : undefined,
            to: filters.to ? new Date(filters.to) : undefined,
            status: filters.status as any,
        });
    }

    /**
     * GET /leaves/adjustments/:employeeId
     * Get adjustment history for an employee
     */
    @Get('adjustments/:employeeId')
    async getAdjustmentHistory(
        @Param('employeeId') employeeId: string,
        @Query('leaveTypeId') leaveTypeId?: string
    ) {
        return this.leavesService.getAdjustmentHistory(employeeId, leaveTypeId);
    }

    /**
     * GET /leaves/accrual/:employeeId
     * Get accrual history for an employee
     */
    @Get('accrual/:employeeId')
    async getAccrualHistory(
        @Param('employeeId') employeeId: string,
        @Query('leaveTypeId') leaveTypeId?: string
    ) {
        return this.leavesService.getAccrualHistory(employeeId, leaveTypeId);
    }

    /**
     * GET /leaves/statistics
     * Get leave statistics with optional filters
     */
    @Get('statistics')
    async getLeaveStatistics(@Query() filters: {
        employeeId?: string;
        managerId?: string;
        departmentId?: string;
        from?: string;
        to?: string;
    }) {
        return this.leavesService.getLeaveStatistics({
            employeeId: filters.employeeId,
            managerId: filters.managerId,
            departmentId: filters.departmentId,
            from: filters.from ? new Date(filters.from) : undefined,
            to: filters.to ? new Date(filters.to) : undefined,
        });
    }

    /**
     * GET /leaves/monitoring/low-balance
     * Get employees with low leave balance
     */
    @Get('monitoring/low-balance')
    async getLowBalanceEmployees(@Query('threshold') threshold?: string) {
        const thresholdValue = threshold ? parseFloat(threshold) : 5;
        return this.leavesService.getLowBalanceEmployees(thresholdValue);
    }

    /**
     * GET /leaves/monitoring/excessive-usage
     * Get employees with excessive leave usage
     */
    @Get('monitoring/excessive-usage')
    async getExcessiveUsageEmployees(@Query('threshold') threshold?: string) {
        const thresholdValue = threshold ? parseFloat(threshold) : 0.8;
        return this.leavesService.getExcessiveUsageEmployees(thresholdValue);
    }
}
