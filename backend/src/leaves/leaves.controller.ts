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
  UseGuards,
} from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { JwtAuthGuard } from '../auth/authorization/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/authorization/guards/roles.guard';
import { Roles } from '../auth/authorization/decorators/roles.decorators';
import { UserRole } from '../auth/authorization/constants/roles.constant';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { ModifyLeaveRequestDto } from './dto/modify-leave-request.dto';
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { ReviewRequestDto } from './dto/review-request.dto';
import { DelegateApprovalDto } from './dto/delegate-approval.dto';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { AssignVacationPackageDto } from './dto/assign-vacation-package.dto';
import { EncashLeaveDto } from './dto/encash-leave.dto';
import { CreateApprovalWorkflowDto } from './dto/create-approval-workflow.dto';
// Import DTOs for type safety (you will need to create these files)
// import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
// import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto';

@Controller('leaves') // Base route is /leaves
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  // --- 1. Employee Self-Service & Submission ---

  /**
   * POST /leaves/request
   * Handles submission of a new leave request (REQ-015).
   */
  @Post('request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DEPARTMENT_EMPLOYEE, UserRole.DEPARTMENT_HEAD)
  @UsePipes(new ValidationPipe({ transform: true })) // Enables validation and automatic transformation
  async submitRequest(@Body() createRequestDto: CreateLeaveRequestDto) {
    return this.leavesService.submitRequest(createRequestDto);
  }

  /**
   * GET /leaves/balances/:employeeId
   * Retrieves the current leave balances for an employee (Accrued, Taken, Remaining) (REQ-040).
   */
  @Get('balances/:employeeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.DEPARTMENT_EMPLOYEE,
    UserRole.DEPARTMENT_HEAD,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
    UserRole.SYSTEM_ADMIN,
  )
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DEPARTMENT_HEAD, UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  async reviewRequest(
    @Param('id') requestId: string,
    @Body() reviewData: ReviewRequestDto,
  ) {
    // Service logic handles routing based on 'isHR' and 'action'
    return this.leavesService.processReview(requestId, reviewData);
  }

  @Put('request/:id/modify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DEPARTMENT_EMPLOYEE)
  async modifyRequest(
    @Param('id') requestId: string,
    @Body() body: ModifyLeaveRequestDto,
  ) {
    return this.leavesService.modifyRequest(requestId, body);
  }

  @Put('request/:id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DEPARTMENT_EMPLOYEE, UserRole.HR_ADMIN)
  async cancelRequest(@Param('id') requestId: string) {
    return this.leavesService.cancelRequest(requestId);
  }

  @Put('request/:id/delegate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DEPARTMENT_HEAD)
  async delegateApproval(
    @Param('id') requestId: string,
    @Body() body: DelegateApprovalDto,
  ) {
    return this.leavesService.delegateApproval(
      requestId,
      body.delegateTo,
      body.delegatorId,
    );
  }

  // --- 3. HR/System Admin Configuration ---

  /**
   * POST /leaves/policies
   * Creates a new standardized leave policy (e.g., Annual, Sick). (REQ-006)
   */
  @Post('policies')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  async createPolicy(@Body() policyData: CreateLeavePolicyDto) {
    return this.leavesService.createPolicy(policyData);
  }

  @Post('types')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HR_ADMIN)
  async createLeaveType(@Body() payload: CreateLeaveTypeDto) {
    return this.leavesService.createLeaveType(payload);
  }

  @Get('types')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  async getLeaveTypes() {
    return this.leavesService.getLeaveTypes();
  }

  @Put('types/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HR_ADMIN)
  async updateLeaveType(
    @Param('id') id: string,
    @Body() payload: Partial<CreateLeaveTypeDto>,
  ) {
    return this.leavesService.updateLeaveType(id, payload);
  }

  @Post('holidays')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  async createHoliday(@Body() payload: CreateHolidayDto) {
    return this.leavesService.createHoliday(payload);
  }

  @Post('vacation-packages/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HR_ADMIN)
  async assignVacationPackage(@Body() payload: AssignVacationPackageDto) {
    return this.leavesService.assignVacationPackage(payload);
  }

  @Post('workflows')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HR_ADMIN)
  async createWorkflow(@Body() payload: CreateApprovalWorkflowDto) {
    return this.leavesService.createApprovalWorkflow(payload);
  }

  /** Encashment */
  @Post('encash')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER, UserRole.SYSTEM_ADMIN)
  async encashLeave(@Body() payload: EncashLeaveDto) {
    return this.leavesService.encashLeave(payload);
  }

  /**
   * PUT /leaves/balances/adjust
   * Allows HR Admin to perform manual adjustments (e.g., for audit findings, bulk updates). (REQ-013)
   */
  @Put('balances/adjust')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HR_ADMIN)
  async adjustBalance(@Body() adjustmentData: AdjustBalanceDto) {
    // The service must log this action to maintain a full audit trail (BR 17)
    return this.leavesService.manualAdjustBalance(adjustmentData);
  }

  /**
   * GET /leaves/reports/irregular
   * Managers monitor and flag irregular leave patterns (BR 55).
   */
  @Get('reports/irregular')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DEPARTMENT_HEAD, UserRole.HR_ADMIN)
  async getIrregularLeaveReport(@Query('managerId') managerId: string) {
    return this.leavesService.getIrregularLeaveReport(managerId);
  }

  @Get('requests/employee/:employeeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.DEPARTMENT_EMPLOYEE,
    UserRole.HR_ADMIN,
    UserRole.DEPARTMENT_HEAD,
  )
  async getRequestsByEmployee(@Param('employeeId') employeeId: string) {
    return this.leavesService.getRequestsByEmployee(employeeId);
  }

  @Get('team/:managerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DEPARTMENT_HEAD, UserRole.HR_ADMIN)
  async getTeamLeaves(@Param('managerId') managerId: string) {
    return this.leavesService.getTeamLeaves(managerId);
  }
}
