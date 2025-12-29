import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LeaveService } from './leaves.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Permissions } from '../auth/decorators/roles.decorators';
import { Permission } from '../auth/permissions.constant';
import { CurrentUser } from '../auth/decorators/roles.decorators';
import type { AuthUser } from '../auth/auth-user.interface';

/* ----------  DTOs  ---------- */
import {
  CreateLeaveTypeDto,
  UpdateLeaveTypeDto,
  CreatePolicyDto,
  UpdatePolicyDto,
  CreateEntitlementDto,
  AdjustBalanceDto,
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  ApproveRejectDto,
  ManagerApprovalDto,
  HrApprovalDto,
  HrFinalizeDto,
  BulkApproveDto,
  BulkRejectDto,
  CreateCalendarDto,
  ListRequestsFilterDto,
} from './dto';

@Controller('leaves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveController {
  constructor(private readonly leavesService: LeaveService) {}

  /* =========================================================
     1. POLICY SET-UP
     ========================================================= */

  @Get('categories')
  getCategories() {
    return this.leavesService.listCategories();
  }

  @Post('types')
  @Permissions(Permission.MANAGE_LEAVES)
  createType(@Body() dto: CreateLeaveTypeDto) {
    return this.leavesService.createLeaveType(dto);
  }

  @Get('types')
  listTypes() {
    return this.leavesService.listLeaveTypes();
  }

  @Put('types/:id')
  @Permissions(Permission.MANAGE_LEAVES)
  updateType(@Param('id') id: string, @Body() dto: UpdateLeaveTypeDto) {
    return this.leavesService.updateLeaveType(id, dto);
  }

  @Post('policies')
  @Permissions(Permission.MANAGE_LEAVES)
  createPolicy(@Body() dto: CreatePolicyDto) {
    return this.leavesService.createPolicy(dto);
  }

  @Get('policies')
  listPolicies() {
    return this.leavesService.listPolicies();
  }

  @Put('policies/:id')
  @Permissions(Permission.MANAGE_LEAVES)
  updatePolicy(@Param('id') id: string, @Body() dto: UpdatePolicyDto) {
    return this.leavesService.updatePolicy(id, dto);
  }

  @Post('entitlements')
  @Permissions(Permission.MANAGE_LEAVES)
  createEntitlement(@Body() dto: CreateEntitlementDto) {
    return this.leavesService.createEntitlement(dto);
  }

  @Get('entitlements')
  listEntitlements() {
    return this.leavesService.listEntitlements();
  }

  @Get('entitlements/:employeeId')
  getEntitlement(@Param('employeeId') employeeId: string) {
    return this.leavesService.getEntitlement(employeeId);
  }

  @Patch('entitlements/:id')
  @Permissions(Permission.MANAGE_LEAVES)
  updateEntitlement(@Param('id') id: string, @Body() dto: Partial<CreateEntitlementDto>) {
    return this.leavesService.updateEntitlement(id, dto);
  }

  @Patch('entitlements/:employeeId/adjust')
  @Permissions(Permission.MANAGE_LEAVES)
  adjustBalance(
    @Param('employeeId') employeeId: string,
    @Body() dto: AdjustBalanceDto,
    @CurrentUser() hrUser: AuthUser,
  ) {
    return this.leavesService.manualAdjust(employeeId, dto, hrUser.userId);
  }

  @Get('calendars/:year')
  getCalendar(@Param('year') year: string) {
    return this.leavesService.getCalendar(parseInt(year));
  }

  @Post('calendars')
  @Permissions(Permission.MANAGE_LEAVES)
  createCalendar(@Body() dto: CreateCalendarDto) {
    return this.leavesService.createCalendar(dto.year, dto.holidays, dto.blockedPeriods);
  }

  /* =========================================================
     2. REQUEST WORKFLOW
     ========================================================= */

  @Post('requests')
  submitRequest(@Body() dto: CreateLeaveRequestDto, @CurrentUser() user: AuthUser) {
    console.log('📨 Received leave request:', {
      leaveTypeId: dto.leaveTypeId,
      dates: {
        from: dto.dates.from,
        to: dto.dates.to,
        fromType: typeof dto.dates.from,
        toType: typeof dto.dates.to,
        fromIsDate: dto.dates.from instanceof Date,
        toIsDate: dto.dates.to instanceof Date,
      },
      justification: dto.justification,
      userId: user.userId,
    });
    return this.leavesService.submitRequest(dto, user.userId);
  }

  @Patch('requests/:id')
  modifyRequest(
    @Param('id') id: string,
    @Body() dto: UpdateLeaveRequestDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.leavesService.modifyRequest(id, dto, user.userId);
  }

  @Delete('requests/:id')
  cancelRequest(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.leavesService.cancelRequest(id, user.userId);
  }

  @Patch('requests/:id/manager-action')
  @Permissions(Permission.APPROVE_LEAVES)
  managerAction(
    @Param('id') id: string,
    @Body() dto: ApproveRejectDto,
    @CurrentUser() manager: AuthUser,
  ) {
    return this.leavesService.managerAction(id, dto, manager.userId);
  }

  @Patch('requests/:id/hr-finalize')
  @Permissions(Permission.MANAGE_LEAVES)
  hrFinalize(
    @Param('id') id: string,
    @Body() dto: HrFinalizeDto,
    @CurrentUser() hr: AuthUser,
  ) {
    return this.leavesService.hrFinalize(id, dto, hr.userId);
  }

  @Post('requests/bulk-approve')
  @Permissions(Permission.MANAGE_LEAVES)
  bulkApprove(@Body() dto: BulkApproveDto, @CurrentUser() manager: AuthUser) {
    return this.leavesService.bulkApprove(dto.ids, manager.userId);
  }

  @Post('requests/bulk-reject')
  @Permissions(Permission.MANAGE_LEAVES)
  bulkReject(@Body() dto: BulkRejectDto, @CurrentUser() manager: AuthUser) {
    return this.leavesService.bulkReject(dto.ids, manager.userId, dto.reason);
  }

  /**
   * TWO-LEVEL APPROVAL WORKFLOW
   * Manager approves first, then HR admin makes the final decision
   */
  @Patch('requests/:id/manager-approve')
  @Permissions(Permission.APPROVE_LEAVES)
  managerApprove(
    @Param('id') id: string,
    @Body() dto: ManagerApprovalDto,
    @CurrentUser() manager: AuthUser,
  ) {
    return this.leavesService.managerApprove(id, dto, manager.userId);
  }

  @Patch('requests/:id/hr-approve')
  @Permissions(Permission.MANAGE_LEAVES)
  hrApprove(
    @Param('id') id: string,
    @Body() dto: HrApprovalDto,
    @CurrentUser() hr: AuthUser,
  ) {
    return this.leavesService.hrApprove(id, dto, hr.userId);
  }

  /* =========================================================
     3. TRACKING
     ========================================================= */

  @Get('my/balance')
  myBalance(@CurrentUser() user: AuthUser) {
    return this.leavesService.getEmployeeBalance(user.userId);
  }

  @Get('my/requests')
  myRequests(@CurrentUser() user: AuthUser, @Query() q: ListRequestsFilterDto) {
    return this.leavesService.getEmployeeRequests(user.userId, q);
  }

  @Get('team/requests')
  teamRequests(@CurrentUser() manager: AuthUser) {
    return this.leavesService.getTeamRequests(manager.userId);
  }

  @Get('team/requests/filtered')
  teamRequestsFiltered(@CurrentUser() manager: AuthUser, @Query() filters: ListRequestsFilterDto) {
    return this.leavesService.getTeamRequestsWithFilters(manager.userId, filters);
  }

  @Get('team/balances')
  teamBalances(@CurrentUser() manager: AuthUser) {
    return this.leavesService.getTeamBalances(manager.userId);
  }

  @Get('audit/adjustments/:employeeId')
  @Permissions(Permission.MANAGE_LEAVES)
  getAdjustments(@Param('employeeId') employeeId: string) {
    return this.leavesService.getAdjustmentLog(employeeId);
  }

  /* =========================================================
     4. BATCH JOBS
     ========================================================= */

  @Post('accrual/run')
  @Permissions(Permission.MANAGE_LEAVES)
  runAccrual() {
    return this.leavesService.runAccrual();
  }

  @Post('carry-forward/run')
  @Permissions(Permission.MANAGE_LEAVES)
  runCarryForward() {
    return this.leavesService.runCarryForward();
  }
  
  /* -------- flag irregular pattern -------- */
@Patch('requests/:id/flag')
@Permissions(Permission.VIEW_TEAM_ATTENDANCE)
flagIrregular(
  @Param('id') id: string,
  @Body() body: { reason: string },
  @CurrentUser() manager: AuthUser,
) {
  return this.leavesService.flagIrregular(id, body.reason, manager.userId);
}

}