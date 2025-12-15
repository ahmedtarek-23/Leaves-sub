import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Permissions, CurrentUser } from '../auth/decorators/roles.decorators';
import { Permission } from '../auth/permissions.constant';
import type { AuthUser } from '../auth/auth-user.interface';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { CreateBlockedPeriodDto } from './dto/create-blocked-period.dto';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { CreateLeaveCategoryDto } from './dto/create-leave-category.dto';
import { CreateResetPolicyDto } from './dto/create-reset-policy.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { CreateDelegationDto } from './dto/create-delegation.dto';
import { Types } from 'mongoose';

@Controller('leaves') // Base route is /leaves
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  // --- 1. Employee Self-Service & Submission ---

  /**
   * POST /leaves/request
   * Handles submission of a new leave request (REQ-015).
   */
  @Post('request')
  @Permissions(Permission.REQUEST_LEAVE)
  @UsePipes(new ValidationPipe({ transform: true }))
  async submitRequest(
    @Body()
    createRequestDto: any,
    @CurrentUser() user: AuthUser,
  ) {
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

  // --- 2. Approval Workflow ---

  /**
   * PUT /leaves/request/:id/review
   * Handles the multi-level approval chain: Manager (REQ-021) or HR Admin (REQ-025).
   * The logic inside the service determines the next step and final synchronization (REQ-042).
   */
  @Put('request/:id/review')
  @Permissions(Permission.APPROVE_LEAVES)
  async reviewRequest(
    @Param('id') requestId: string,
    @Body()
    reviewData: {
      approverId: string;
      action: 'APPROVE' | 'REJECT' | 'OVERRIDE';
      isHR: boolean;
    },
  ) {
    return this.leavesService.processReview(requestId, reviewData);
  }

  // --- 3. HR/System Admin Configuration ---

  /**
   * POST /leaves/policies
   * Creates a new standardized leave policy (e.g., Annual, Sick). (REQ-006)
   */
  @Post('policies')
  @Permissions(Permission.MANAGE_LEAVES)
  async createPolicy(
    @Body() policyData: any,
  ) {
    return this.leavesService.createPolicy(policyData);
  }

  /**
   * PUT /leaves/balances/adjust
   * Allows HR Admin to perform manual adjustments (e.g., for audit findings, bulk updates). (REQ-013)
   */
  @Put('balances/adjust')
  @Permissions(Permission.MANAGE_LEAVES)
  async adjustBalance(
    @Body()
    adjustmentData: {
      employeeId: string;
      typeCode: string;
      amount: number;
      justification: string;
    },
  ) {
    return this.leavesService.manualAdjustBalance(adjustmentData);
  }

  /**
   * GET /leaves/reports/irregular
   * Managers monitor and flag irregular leave patterns (BR 55).
   */
  @Get('reports/irregular')
  async getIrregularLeaveReport(@Query('managerId') managerId: string) {
    return this.leavesService.getIrregularLeaveReport(managerId);
  }

  @Get('request')
  async getRequests(@Query() query: any) {
    return this.leavesService.getRequests(query);
  }

  @Get('request/:id')
  async getRequestById(@Param('id') requestId: string) {
    return this.leavesService.getRequests(requestId);
  }

  @Put('request/:id/cancel')
  async cancelRequest(
    @Param('id') requestId: string,
    @Body() data: { employeeId: string },
  ) {
    return this.leavesService.cancelRequest(requestId, data.employeeId);
  }

  // Add these endpoints to your existing LeavesController

  @Post('bulk-review')
  async bulkReview(
    @Body()
    bulkReviewData: {
      requestIds: string[];
      approverId: string;
      action: 'APPROVE' | 'REJECT';
      isHR: boolean;
      comments?: string;
    },
  ) {
    return this.leavesService.bulkReview(bulkReviewData);
  }

  @Post('request/:id/attachments')
  async addAttachment(
    @Param('id') requestId: string,
    @Body()
    attachmentData: {
      fileUrl: string;
      fileName: string;
      fileType: string;
      uploadedBy: string;
    },
  ) {
    return this.leavesService.addAttachment(requestId, attachmentData);
  }

  @Put('request/:id/verify-medical')
  async verifyMedicalDocuments(
    @Param('id') requestId: string,
    @Body()
    verificationData: {
      verifiedBy: string;
      isValid: boolean;
      comments?: string;
    },
  ) {
    return this.leavesService.verifyMedicalDocuments(
      requestId,
      verificationData,
    );
  }

  @Put('request/:id/flag')
  async flagLeaveRequest(
    @Param('id') requestId: string,
    @Body()
    flagData: {
      flaggedBy: string;
      reason: string;
      priority: 'LOW' | 'MEDIUM' | 'HIGH';
    },
  ) {
    return this.leavesService.flagLeaveRequest(requestId, flagData);
  }

  // In your leaves.controller.ts
  @Post('encash/:id')
  @Permissions(Permission.MANAGE_LEAVES)
  async encashLeave(
    @Param('id') requestId: string,
    @Body() encashData: { dailySalaryRate: number },
  ) {
    return this.leavesService.encashLeave({
      requestId,
      dailySalaryRate: encashData.dailySalaryRate,
    });
  }

  // ============ LEAVE CALENDAR MANAGEMENT (REQ-010) ============

  /**
   * POST /leaves/calendar/:year/holidays
   * Add a holiday to the calendar (HR_ADMIN only)
   */
  @Post('calendar/:year/holidays')
  @Permissions(Permission.MANAGE_LEAVES)
  @UsePipes(new ValidationPipe({ transform: true }))
  async addHoliday(
    @Param('year') year: number,
    @Body() holidayData: CreateHolidayDto,
  ) {
    return this.leavesService.addHoliday(year, holidayData);
  }

  /**
   * DELETE /leaves/calendar/:year/holidays
   * Remove a holiday from the calendar (HR_ADMIN only)
   */
  @Delete('calendar/:year/holidays')
  @Permissions(Permission.MANAGE_LEAVES)
  async removeHoliday(
    @Param('year') year: number,
    @Query('date') date: string,
  ) {
    return this.leavesService.removeHoliday(year, new Date(date));
  }

  /**
   * POST /leaves/calendar/:year/blocked-periods
   * Add a blocked period to the calendar (HR_ADMIN only)
   */
  @Post('calendar/:year/blocked-periods')
  @Permissions(Permission.MANAGE_LEAVES)
  @UsePipes(new ValidationPipe({ transform: true }))
  async addBlockedPeriod(
    @Param('year') year: number,
    @Body() blockedPeriodData: CreateBlockedPeriodDto,
  ) {
    return this.leavesService.addBlockedPeriod(year, blockedPeriodData);
  }

  /**
   * DELETE /leaves/calendar/:year/blocked-periods
   * Remove a blocked period from the calendar (HR_ADMIN only)
   */
  @Delete('calendar/:year/blocked-periods')
  @Permissions(Permission.MANAGE_LEAVES)
  async removeBlockedPeriod(
    @Param('year') year: number,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.leavesService.removeBlockedPeriod(year, new Date(from), new Date(to));
  }

  /**
   * GET /leaves/calendar/:year
   * Get calendar for a year
   */
  @Get('calendar/:year')
  @Permissions(Permission.REQUEST_LEAVE, Permission.APPROVE_LEAVES, Permission.MANAGE_LEAVES)
  async getCalendar(@Param('year') year: number) {
    return this.leavesService.getCalendar(year);
  }

  // ============ LEAVE TYPE & CATEGORY MANAGEMENT (REQ-011) ============

  /**
   * POST /leaves/categories
   * Create a leave category (HR_ADMIN only)
   */
  @Post('categories')
  @Permissions(Permission.MANAGE_LEAVES)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createLeaveCategory(@Body() categoryData: CreateLeaveCategoryDto) {
    return this.leavesService.createLeaveCategory(categoryData);
  }

  /**
   * GET /leaves/categories
   * Get all leave categories
   */
  @Get('categories')
  @Permissions(Permission.REQUEST_LEAVE, Permission.APPROVE_LEAVES, Permission.MANAGE_LEAVES)
  async getLeaveCategories() {
    return this.leavesService.getLeaveCategories();
  }

  /**
   * PUT /leaves/categories/:id
   * Update a leave category (HR_ADMIN only)
   */
  @Put('categories/:id')
  @Permissions(Permission.MANAGE_LEAVES)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateLeaveCategory(
    @Param('id') categoryId: string,
    @Body() updateData: CreateLeaveCategoryDto,
  ) {
    return this.leavesService.updateLeaveCategory(categoryId, updateData);
  }

  /**
   * DELETE /leaves/categories/:id
   * Delete a leave category (HR_ADMIN only)
   */
  @Delete('categories/:id')
  @Permissions(Permission.MANAGE_LEAVES)
  async deleteLeaveCategory(@Param('id') categoryId: string) {
    return this.leavesService.deleteLeaveCategory(categoryId);
  }

  /**
   * POST /leaves/types
   * Create a leave type (HR_ADMIN only)
   */
  @Post('types')
  @Permissions(Permission.MANAGE_LEAVES)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createLeaveType(@Body() leaveTypeData: CreateLeaveTypeDto) {
    return this.leavesService.createLeaveType(leaveTypeData);
  }

  /**
   * GET /leaves/types
   * Get all leave types
   */
  @Get('types')
  @Permissions(Permission.REQUEST_LEAVE, Permission.APPROVE_LEAVES, Permission.MANAGE_LEAVES)
  async getLeaveTypes() {
    return this.leavesService.getLeaveTypes();
  }

  /**
   * PUT /leaves/types/:id
   * Update a leave type (HR_ADMIN only)
   */
  @Put('types/:id')
  @Permissions(Permission.MANAGE_LEAVES)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateLeaveType(
    @Param('id') leaveTypeId: string,
    @Body() updateData: Partial<CreateLeaveTypeDto>,
  ) {
    return this.leavesService.updateLeaveType(leaveTypeId, updateData as any);
  }

  /**
   * DELETE /leaves/types/:id
   * Delete a leave type (HR_ADMIN only)
   */
  @Delete('types/:id')
  @Permissions(Permission.MANAGE_LEAVES)
  async deleteLeaveType(@Param('id') leaveTypeId: string) {
    return this.leavesService.deleteLeaveType(leaveTypeId);
  }

  // ============ RESET-DATE POLICY CONFIGURATION (REQ-012) ============

  /**
   * POST /leaves/reset-policies
   * Create or update reset policy (HR_ADMIN only)
   */
  @Post('reset-policies')
  @Permissions(Permission.MANAGE_LEAVES)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createResetPolicy(@Body() policyData: CreateResetPolicyDto) {
    return this.leavesService.createResetPolicy(policyData);
  }

  /**
   * GET /leaves/reset-policies
   * Get reset policy for organization and leave type
   */
  @Get('reset-policies')
  @Permissions(Permission.MANAGE_LEAVES)
  async getResetPolicy(
    @Query('organizationId') organizationId: string,
    @Query('leaveTypeId') leaveTypeId: string,
  ) {
    return this.leavesService.getResetPolicy(organizationId, leaveTypeId);
  }

  // ============ EDIT PENDING LEAVE REQUESTS (REQ-017) ============

  /**
   * PUT /leaves/request/:id
   * Update a pending leave request (EMPLOYEE only, for their own requests)
   */
  @Put('request/:id')
  @Permissions(Permission.REQUEST_LEAVE)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updatePendingLeaveRequest(
    @Param('id') requestId: string,
    @Body() updateData: UpdateLeaveRequestDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.leavesService.updatePendingLeaveRequest(
      requestId,
      updateData,
      new Types.ObjectId(user.userId),
    );
  }

  /**
   * GET /leaves/request/:id/audit-logs
   * Get audit logs for a leave request
   */
  @Get('request/:id/audit-logs')
  @Permissions(Permission.MANAGE_LEAVES, Permission.APPROVE_LEAVES)
  async getAuditLogs(@Param('id') requestId: string) {
    return this.leavesService.getAuditLogs(requestId);
  }

  // ============ MANAGER DELEGATION (REQ-023) ============

  /**
   * POST /leaves/delegations
   * Create a delegation (MANAGER only)
   */
  @Post('delegations')
  @Permissions(Permission.APPROVE_LEAVES)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createDelegation(
    @Body() delegationData: CreateDelegationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.leavesService.createDelegation(
      new Types.ObjectId(user.userId),
      delegationData,
    );
  }

  /**
   * GET /leaves/delegations/active
   * Get active delegations for current user
   */
  @Get('delegations/active')
  @Permissions(Permission.APPROVE_LEAVES)
  async getActiveDelegations(@CurrentUser() user: AuthUser) {
    return this.leavesService.getActiveDelegations(new Types.ObjectId(user.userId));
  }

  /**
   * DELETE /leaves/delegations/:id
   * Revoke a delegation
   */
  @Delete('delegations/:id')
  @Permissions(Permission.APPROVE_LEAVES)
  async revokeDelegation(
    @Param('id') delegationId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.leavesService.revokeDelegation(
      delegationId,
      new Types.ObjectId(user.userId),
    );
  }

  // ============ ACCRUAL HISTORY ============

  /**
   * GET /leaves/accruals/:employeeId
   * Get accrual history for an employee
   */
  @Get('accruals/:employeeId')
  @Permissions(Permission.MANAGE_LEAVES, Permission.REQUEST_LEAVE)
  async getAccrualHistory(
    @Param('employeeId') employeeId: string,
    @Query('leaveTypeId') leaveTypeId?: string,
  ) {
    return this.leavesService.getAccrualHistory(
      new Types.ObjectId(employeeId),
      leaveTypeId ? new Types.ObjectId(leaveTypeId) : undefined,
    );
  }

  // ============ YEAR-END PROCESSING (REQ-012) ============

  /**
   * POST /leaves/year-end/process
   * Manually trigger year-end processing (HR_ADMIN only)
   */
  @Post('year-end/process')
  @Permissions(Permission.MANAGE_LEAVES)
  async processYearEnd(
    @Query('organizationId') organizationId?: string,
    @Query('year') year?: number,
  ) {
    return this.leavesService.processYearEnd(organizationId, year);
  }
}
