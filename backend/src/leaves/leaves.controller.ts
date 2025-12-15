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
  HrFinalizeDto,
  BulkApproveDto,
  CreateCalendarDto,
  ListRequestsFilterDto,
} from './dto';

@Controller('leaves')
@UseGuards(JwtAuthGuard)
export class LeaveController {
  constructor(private readonly leavesService: LeaveService) {}

  /* =========================================================
     1. POLICY SET-UP
     ========================================================= */

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

  @Get('entitlements/:employeeId')
  getEntitlement(@Param('employeeId') employeeId: string) {
    return this.leavesService.getEntitlement(employeeId);
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
  @Permissions(Permission.VIEW_TEAM_ATTENDANCE)
  teamRequests(@CurrentUser() manager: AuthUser) {
    return this.leavesService.getTeamRequests(manager.userId);
  }

  @Get('team/balances')
  @Permissions(Permission.VIEW_TEAM_ATTENDANCE)
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