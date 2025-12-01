// Deprecated/migrated: kept only to avoid accidental imports. Use leaves.controller.clean.ts
export const LeavesControllerDeprecated = null as unknown as any;

import { Controller, Get, Post, Put, Body, Param, UsePipes, ValidationPipe, Query, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { LeavesService } from './leaves.service';
import { JwtAuthGuard } from '../auth/authorization/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/authorization/guards/roles.guard';
import { Roles } from '../auth/authorization/decorators/roles.decorators';
import { UserRole } from '../auth/authorization/constants/roles.constant';
import { AuthUser } from '../auth/authorization/interfaces/auth-user.interface';

import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { ReviewRequestDto } from './dto/review-request.dto';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { DelegateApprovalDto } from './dto/delegate-approval.dto';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { AssignVacationPackageDto } from './dto/assign-vacation-package.dto';
import { EncashLeaveDto } from './dto/encash-leave.dto';
import { CreateApprovalWorkflowDto } from './dto/create-approval-workflow.dto';
import { AttachmentDto } from './dto/attachment.dto';
import { VerifyMedicalDto } from './dto/verify-medical.dto';
import { FlagLeaveDto } from './dto/flag-leave.dto';
import { BulkReviewDto } from './dto/bulk-review.dto';
import { ModifyLeaveRequestDto } from './dto/modify-leave-request.dto';
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto';
import { GetRequestsFilterDto } from './dto/get-requests-filter.dto';

@Controller('leaves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post('request')
  @Roles(UserRole.DEPARTMENT_EMPLOYEE, UserRole.DEPARTMENT_HEAD)
  @UsePipes(new ValidationPipe({ transform: true }))
  async submitRequest(@Body() createRequestDto: CreateLeaveRequestDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.submitRequest(createRequestDto, req.user);
  }

  @Get('balances/:employeeId')
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

  @Put('request/:id/review')
  @Roles(UserRole.DEPARTMENT_HEAD, UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  async reviewRequest(@Param('id') requestId: string, @Body() reviewData: ReviewRequestDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.processReview(requestId, reviewData, req.user);
  }

  @Put('request/:id/modify')
  @Roles(UserRole.DEPARTMENT_EMPLOYEE)
  async modifyRequest(@Param('id') requestId: string, @Body() body: ModifyLeaveRequestDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.modifyRequest(requestId, body, req.user);
  }

  @Put('request/:id/cancel')
  @Roles(UserRole.DEPARTMENT_EMPLOYEE, UserRole.HR_ADMIN)
  async cancelRequest(@Param('id') requestId: string, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.cancelRequest(requestId, req.user?.employeeId ?? '');
  }

  @Put('request/:id/delegate')
  @Roles(UserRole.DEPARTMENT_HEAD)
  async delegateApproval(@Param('id') requestId: string, @Body() body: DelegateApprovalDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.delegateApproval(requestId, body.delegateTo, body.delegatorId ?? req.user?.employeeId, req.user);
  }

  @Post('policies')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  async createPolicy(@Body() policyData: CreateLeavePolicyDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.createPolicy(policyData, req.user);
  }

  @Post('types')
  @Roles(UserRole.HR_ADMIN)
  async createLeaveType(@Body() payload: CreateLeaveTypeDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.createLeaveType(payload, req.user);
  }

  @Get('types')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  async getLeaveTypes() {
    return this.leavesService.getLeaveTypes();
  }

  @Put('types/:id')
  @Roles(UserRole.HR_ADMIN)
  async updateLeaveType(@Param('id') id: string, @Body() payload: Partial<CreateLeaveTypeDto>, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.updateLeaveType(id, payload, req.user);
  }

  @Post('holidays')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  async createHoliday(@Body() payload: CreateHolidayDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.createHoliday(payload, req.user);
  }

  @Post('vacation-packages/assign')
  @Roles(UserRole.HR_ADMIN)
  async assignVacationPackage(@Body() payload: AssignVacationPackageDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.assignVacationPackage(payload, req.user);
  }

  @Post('workflows')
  @Roles(UserRole.HR_ADMIN)
  async createWorkflow(@Body() payload: CreateApprovalWorkflowDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.createApprovalWorkflow(payload, req.user);
  }

  @Post('encash')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER, UserRole.SYSTEM_ADMIN)
  async encashLeave(@Body() payload: EncashLeaveDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.encashLeave(payload, req.user);
  }

  @Put('balances/adjust')
  @Roles(UserRole.HR_ADMIN)
  async adjustBalance(@Body() adjustmentData: AdjustBalanceDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.manualAdjustBalance(adjustmentData, req.user);
  }

  @Get('reports/irregular')
  @Roles(UserRole.DEPARTMENT_HEAD, UserRole.HR_ADMIN)
  async getIrregularLeaveReport(@Query('managerId') managerId: string) {
    return this.leavesService.getIrregularLeaveReport(managerId);
  }

  @Get('requests/employee/:employeeId')
  @Roles(UserRole.DEPARTMENT_EMPLOYEE, UserRole.HR_ADMIN, UserRole.DEPARTMENT_HEAD)
  async getRequestsByEmployee(@Param('employeeId') employeeId: string) {
    return this.leavesService.getRequestsByEmployee(employeeId);
  }

  @Get('team/:managerId')
  @Roles(UserRole.DEPARTMENT_HEAD, UserRole.HR_ADMIN)
  async getTeamLeaves(@Param('managerId') managerId: string, @Query() query?: GetRequestsFilterDto) {
    return this.leavesService.getTeamLeaves(managerId, query);
  }

  @Get('request')
  async getRequests(@Query() query?: GetRequestsFilterDto) {
    return this.leavesService.getRequests(query || {});
  }

  @Get('request/:id')
  async getRequestById(@Param('id') requestId: string) {
    return this.leavesService.getRequestById(requestId);
  }

  @Post('bulk-review')
  async bulkReview(@Body() bulkReviewData: BulkReviewDto) {
    return this.leavesService.bulkReview(bulkReviewData);
  }

  @Post('request/:id/attachments')
  async addAttachment(@Param('id') requestId: string, @Body() attachmentData: AttachmentDto) {
    return this.leavesService.addAttachment(requestId, attachmentData);
  }

  @Put('request/:id/verify-medical')
  async verifyMedicalDocuments(@Param('id') requestId: string, @Body() verificationData: VerifyMedicalDto) {
    return this.leavesService.verifyMedicalDocuments(requestId, verificationData);
  }

  @Put('request/:id/flag')
  async flagLeaveRequest(@Param('id') requestId: string, @Body() flagData: FlagLeaveDto) {
    return this.leavesService.flagLeaveRequest(requestId, flagData);
  }
}
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
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { LeavesService } from './leaves.service';
import { JwtAuthGuard } from '../auth/authorization/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/authorization/guards/roles.guard';
import { Roles } from '../auth/authorization/decorators/roles.decorators';
import { UserRole } from '../auth/authorization/constants/roles.constant';
import { AuthUser } from '../auth/authorization/interfaces/auth-user.interface';

import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { ReviewRequestDto } from './dto/review-request.dto';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { DelegateApprovalDto } from './dto/delegate-approval.dto';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { AssignVacationPackageDto } from './dto/assign-vacation-package.dto';
import { EncashLeaveDto } from './dto/encash-leave.dto';
import { CreateApprovalWorkflowDto } from './dto/create-approval-workflow.dto';
import { AttachmentDto } from './dto/attachment.dto';
import { VerifyMedicalDto } from './dto/verify-medical.dto';
import { FlagLeaveDto } from './dto/flag-leave.dto';
import { BulkReviewDto } from './dto/bulk-review.dto';
import { ModifyLeaveRequestDto } from './dto/modify-leave-request.dto';
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto';
import { GetRequestsFilterDto } from './dto/get-requests-filter.dto';

@Controller('leaves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post('request')
  @Roles(UserRole.DEPARTMENT_EMPLOYEE, UserRole.DEPARTMENT_HEAD)
  @UsePipes(new ValidationPipe({ transform: true }))
  async submitRequest(@Body() createRequestDto: CreateLeaveRequestDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.submitRequest(createRequestDto, req.user);
  }

  @Get('balances/:employeeId')
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

  @Put('request/:id/review')
  @Roles(UserRole.DEPARTMENT_HEAD, UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  async reviewRequest(
    @Param('id') requestId: string,
    @Body() reviewData: ReviewRequestDto,
    @Req() req: Request & { user?: AuthUser },
  ) {
    return this.leavesService.processReview(requestId, reviewData, req.user);
  }

  @Put('request/:id/modify')
  @Roles(UserRole.DEPARTMENT_EMPLOYEE)
  async modifyRequest(
    @Param('id') requestId: string,
    @Body() body: ModifyLeaveRequestDto,
    @Req() req: Request & { user?: AuthUser },
  ) {
    return this.leavesService.modifyRequest(requestId, body, req.user);
  }

  @Put('request/:id/cancel')
  @Roles(UserRole.DEPARTMENT_EMPLOYEE, UserRole.HR_ADMIN)
  async cancelRequest(@Param('id') requestId: string, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.cancelRequest(requestId, req.user?.employeeId ?? '');
  }

  @Put('request/:id/delegate')
  @Roles(UserRole.DEPARTMENT_HEAD)
  async delegateApproval(
    @Param('id') requestId: string,
    @Body() body: DelegateApprovalDto,
    @Req() req: Request & { user?: AuthUser },
  ) {
    return this.leavesService.delegateApproval(requestId, body.delegateTo, body.delegatorId ?? req.user?.employeeId, req.user);
  }

  @Post('policies')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  async createPolicy(@Body() policyData: CreateLeavePolicyDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.createPolicy(policyData, req.user);
  }

  @Post('types')
  @Roles(UserRole.HR_ADMIN)
  async createLeaveType(@Body() payload: CreateLeaveTypeDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.createLeaveType(payload, req.user);
  }

  @Get('types')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  async getLeaveTypes() {
    return this.leavesService.getLeaveTypes();
  }

  @Put('types/:id')
  @Roles(UserRole.HR_ADMIN)
  async updateLeaveType(@Param('id') id: string, @Body() payload: Partial<CreateLeaveTypeDto>, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.updateLeaveType(id, payload, req.user);
  }

  @Post('holidays')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  async createHoliday(@Body() payload: CreateHolidayDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.createHoliday(payload, req.user);
  }

  @Post('vacation-packages/assign')
  @Roles(UserRole.HR_ADMIN)
  async assignVacationPackage(@Body() payload: AssignVacationPackageDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.assignVacationPackage(payload, req.user);
  }

  @Post('workflows')
  @Roles(UserRole.HR_ADMIN)
  async createWorkflow(@Body() payload: CreateApprovalWorkflowDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.createApprovalWorkflow(payload, req.user);
  }

  @Post('encash')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER, UserRole.SYSTEM_ADMIN)
  async encashLeave(@Body() payload: EncashLeaveDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.encashLeave(payload, req.user);
  }

  @Put('balances/adjust')
  @Roles(UserRole.HR_ADMIN)
  async adjustBalance(@Body() adjustmentData: AdjustBalanceDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.manualAdjustBalance(adjustmentData, req.user);
  }

  @Get('reports/irregular')
  @Roles(UserRole.DEPARTMENT_HEAD, UserRole.HR_ADMIN)
  async getIrregularLeaveReport(@Query('managerId') managerId: string) {
    return this.leavesService.getIrregularLeaveReport(managerId);
  }

  @Get('requests/employee/:employeeId')
  @Roles(UserRole.DEPARTMENT_EMPLOYEE, UserRole.HR_ADMIN, UserRole.DEPARTMENT_HEAD)
  async getRequestsByEmployee(@Param('employeeId') employeeId: string) {
    return this.leavesService.getRequestsByEmployee(employeeId);
  }

  @Get('team/:managerId')
  @Roles(UserRole.DEPARTMENT_HEAD, UserRole.HR_ADMIN)
  async getTeamLeaves(@Param('managerId') managerId: string, @Query() query?: GetRequestsFilterDto) {
    return this.leavesService.getTeamLeaves(managerId, query);
  }

  @Get('request')
  async getRequests(@Query() query?: GetRequestsFilterDto) {
    return this.leavesService.getRequests(query || {});
  }

  @Get('request/:id')
  async getRequestById(@Param('id') requestId: string) {
    return this.leavesService.getRequestById(requestId);
  }

  @Post('bulk-review')
  async bulkReview(@Body() bulkReviewData: BulkReviewDto) {
    return this.leavesService.bulkReview(bulkReviewData);
  }

  @Post('request/:id/attachments')
  async addAttachment(@Param('id') requestId: string, @Body() attachmentData: AttachmentDto) {
    return this.leavesService.addAttachment(requestId, attachmentData);
  }

  @Put('request/:id/verify-medical')
  async verifyMedicalDocuments(@Param('id') requestId: string, @Body() verificationData: VerifyMedicalDto) {
    return this.leavesService.verifyMedicalDocuments(requestId, verificationData);
  }

  @Put('request/:id/flag')
  async flagLeaveRequest(@Param('id') requestId: string, @Body() flagData: FlagLeaveDto) {
    return this.leavesService.flagLeaveRequest(requestId, flagData);
  }
}
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
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { LeavesService } from './leaves.service';
import { JwtAuthGuard } from '../auth/authorization/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/authorization/guards/roles.guard';
import { Roles } from '../auth/authorization/decorators/roles.decorators';
import { UserRole } from '../auth/authorization/constants/roles.constant';
import { AuthUser } from '../auth/authorization/interfaces/auth-user.interface';

import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { ReviewRequestDto } from './dto/review-request.dto';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { DelegateApprovalDto } from './dto/delegate-approval.dto';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { AssignVacationPackageDto } from './dto/assign-vacation-package.dto';
import { EncashLeaveDto } from './dto/encash-leave.dto';
import { CreateApprovalWorkflowDto } from './dto/create-approval-workflow.dto';
import { AttachmentDto } from './dto/attachment.dto';
import { VerifyMedicalDto } from './dto/verify-medical.dto';
import { FlagLeaveDto } from './dto/flag-leave.dto';
import { BulkReviewDto } from './dto/bulk-review.dto';
import { ModifyLeaveRequestDto } from './dto/modify-leave-request.dto';
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto';
import { GetRequestsFilterDto } from './dto/get-requests-filter.dto';

@Controller('leaves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post('request')
  @Roles(UserRole.DEPARTMENT_EMPLOYEE, UserRole.DEPARTMENT_HEAD)
  @UsePipes(new ValidationPipe({ transform: true }))
  async submitRequest(@Body() createRequestDto: CreateLeaveRequestDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.submitRequest(createRequestDto, req.user);
  }

  @Get('balances/:employeeId')
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

  @Put('request/:id/review')
  @Roles(UserRole.DEPARTMENT_HEAD, UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  async reviewRequest(
    @Param('id') requestId: string,
    @Body() reviewData: ReviewRequestDto,
    @Req() req: Request & { user?: AuthUser },
  ) {
    return this.leavesService.processReview(requestId, reviewData, req.user);
  }

  @Put('request/:id/modify')
  @Roles(UserRole.DEPARTMENT_EMPLOYEE)
  async modifyRequest(
    @Param('id') requestId: string,
    @Body() body: ModifyLeaveRequestDto,
    @Req() req: Request & { user?: AuthUser },
  ) {
    return this.leavesService.modifyRequest(requestId, body, req.user);
  }

  @Put('request/:id/cancel')
  @Roles(UserRole.DEPARTMENT_EMPLOYEE, UserRole.HR_ADMIN)
  async cancelRequest(@Param('id') requestId: string, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.cancelRequest(requestId, req.user?.employeeId ?? '');
  }

  @Put('request/:id/delegate')
  @Roles(UserRole.DEPARTMENT_HEAD)
  async delegateApproval(
    @Param('id') requestId: string,
    @Body() body: DelegateApprovalDto,
    @Req() req: Request & { user?: AuthUser },
  ) {
    return this.leavesService.delegateApproval(requestId, body.delegateTo, body.delegatorId ?? req.user?.employeeId, req.user);
  }

  @Post('policies')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  async createPolicy(@Body() policyData: CreateLeavePolicyDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.createPolicy(policyData, req.user);
  }

  @Post('types')
  @Roles(UserRole.HR_ADMIN)
  async createLeaveType(@Body() payload: CreateLeaveTypeDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.createLeaveType(payload, req.user);
  }

  @Get('types')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  async getLeaveTypes() {
    return this.leavesService.getLeaveTypes();
  }

  @Put('types/:id')
  @Roles(UserRole.HR_ADMIN)
  async updateLeaveType(@Param('id') id: string, @Body() payload: Partial<CreateLeaveTypeDto>, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.updateLeaveType(id, payload, req.user);
  }

  @Post('holidays')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  async createHoliday(@Body() payload: CreateHolidayDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.createHoliday(payload, req.user);
  }

  @Post('vacation-packages/assign')
  @Roles(UserRole.HR_ADMIN)
  async assignVacationPackage(@Body() payload: AssignVacationPackageDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.assignVacationPackage(payload, req.user);
  }

  @Post('workflows')
  @Roles(UserRole.HR_ADMIN)
  async createWorkflow(@Body() payload: CreateApprovalWorkflowDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.createApprovalWorkflow(payload, req.user);
  }

  @Post('encash')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER, UserRole.SYSTEM_ADMIN)
  async encashLeave(@Body() payload: EncashLeaveDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.encashLeave(payload, req.user);
  }

  @Put('balances/adjust')
  @Roles(UserRole.HR_ADMIN)
  async adjustBalance(@Body() adjustmentData: AdjustBalanceDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.manualAdjustBalance(adjustmentData, req.user);
  }

  @Get('reports/irregular')
  @Roles(UserRole.DEPARTMENT_HEAD, UserRole.HR_ADMIN)
  async getIrregularLeaveReport(@Query('managerId') managerId: string) {
    return this.leavesService.getIrregularLeaveReport(managerId);
  }

  @Get('requests/employee/:employeeId')
  @Roles(UserRole.DEPARTMENT_EMPLOYEE, UserRole.HR_ADMIN, UserRole.DEPARTMENT_HEAD)
  async getRequestsByEmployee(@Param('employeeId') employeeId: string) {
    return this.leavesService.getRequestsByEmployee(employeeId);
  }

  @Get('team/:managerId')
  @Roles(UserRole.DEPARTMENT_HEAD, UserRole.HR_ADMIN)
  async getTeamLeaves(@Param('managerId') managerId: string, @Query() query?: GetRequestsFilterDto) {
    return this.leavesService.getTeamLeaves(managerId, query);
  }

  @Get('request')
  async getRequests(@Query() query?: GetRequestsFilterDto) {
    return this.leavesService.getRequests(query || {});
  }

  @Get('request/:id')
  async getRequestById(@Param('id') requestId: string) {
    return this.leavesService.getRequestById(requestId);
  }

  @Post('bulk-review')
  async bulkReview(@Body() bulkReviewData: BulkReviewDto) {
    return this.leavesService.bulkReview(bulkReviewData);
  }

  @Post('request/:id/attachments')
  async addAttachment(@Param('id') requestId: string, @Body() attachmentData: AttachmentDto) {
    return this.leavesService.addAttachment(requestId, attachmentData);
  }

  @Put('request/:id/verify-medical')
  async verifyMedicalDocuments(@Param('id') requestId: string, @Body() verificationData: VerifyMedicalDto) {
    return this.leavesService.verifyMedicalDocuments(requestId, verificationData);
  }

  @Put('request/:id/flag')
  async flagLeaveRequest(@Param('id') requestId: string, @Body() flagData: FlagLeaveDto) {
    return this.leavesService.flagLeaveRequest(requestId, flagData);
  }
}
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
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { LeavesService } from './leaves.service';
import { JwtAuthGuard } from '../auth/authorization/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/authorization/guards/roles.guard';
import { Roles } from '../auth/authorization/decorators/roles.decorators';
import { UserRole } from '../auth/authorization/constants/roles.constant';
import { AuthUser } from '../auth/authorization/interfaces/auth-user.interface';

import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { ReviewRequestDto } from './dto/review-request.dto';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { DelegateApprovalDto } from './dto/delegate-approval.dto';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { AssignVacationPackageDto } from './dto/assign-vacation-package.dto';
import { EncashLeaveDto } from './dto/encash-leave.dto';
import { CreateApprovalWorkflowDto } from './dto/create-approval-workflow.dto';
import { AttachmentDto } from './dto/attachment.dto';
import { VerifyMedicalDto } from './dto/verify-medical.dto';
import { FlagLeaveDto } from './dto/flag-leave.dto';
import { BulkReviewDto } from './dto/bulk-review.dto';
import { ModifyLeaveRequestDto } from './dto/modify-leave-request.dto';
import { GetRequestsFilterDto } from './dto/get-requests-filter.dto';
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto';

@Controller('leaves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post('request')
  @Roles(UserRole.DEPARTMENT_EMPLOYEE, UserRole.DEPARTMENT_HEAD)
  @UsePipes(new ValidationPipe({ transform: true }))
  async submitRequest(@Body() createRequestDto: CreateLeaveRequestDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.submitRequest(createRequestDto, req.user);
  }

  @Get('balances/:employeeId')
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

  @Put('request/:id/review')
  @Roles(UserRole.DEPARTMENT_HEAD, UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  async reviewRequest(
    @Param('id') requestId: string,
    @Body() reviewData: ReviewRequestDto,
    @Req() req: Request & { user?: AuthUser },
  ) {
    return this.leavesService.processReview(requestId, reviewData, req.user);
  }

  @Put('request/:id/modify')
  @Roles(UserRole.DEPARTMENT_EMPLOYEE)
  async modifyRequest(
    @Param('id') requestId: string,
    @Body() body: ModifyLeaveRequestDto,
    @Req() req: Request & { user?: AuthUser },
  ) {
    return this.leavesService.modifyRequest(requestId, body, req.user);
  }

  @Put('request/:id/cancel')
  @Roles(UserRole.DEPARTMENT_EMPLOYEE, UserRole.HR_ADMIN)
  async cancelRequest(@Param('id') requestId: string, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.cancelRequest(requestId, req.user?.employeeId ?? '');
  }

  @Put('request/:id/delegate')
  @Roles(UserRole.DEPARTMENT_HEAD)
  async delegateApproval(
    @Param('id') requestId: string,
    @Body() body: DelegateApprovalDto,
    @Req() req: Request & { user?: AuthUser },
  ) {
    return this.leavesService.delegateApproval(requestId, body.delegateTo, body.delegatorId ?? req.user?.employeeId, req.user);
  }

  @Post('policies')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  async createPolicy(@Body() policyData: CreateLeavePolicyDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.createPolicy(policyData, req.user);
  }

  @Post('types')
  @Roles(UserRole.HR_ADMIN)
  async createLeaveType(@Body() payload: CreateLeaveTypeDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.createLeaveType(payload, req.user);
  }

  @Get('types')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  async getLeaveTypes() {
    return this.leavesService.getLeaveTypes();
  }

  @Put('types/:id')
  @Roles(UserRole.HR_ADMIN)
  async updateLeaveType(@Param('id') id: string, @Body() payload: Partial<CreateLeaveTypeDto>, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.updateLeaveType(id, payload, req.user);
  }

  @Post('holidays')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  async createHoliday(@Body() payload: CreateHolidayDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.createHoliday(payload, req.user);
  }

  @Post('vacation-packages/assign')
  @Roles(UserRole.HR_ADMIN)
  async assignVacationPackage(@Body() payload: AssignVacationPackageDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.assignVacationPackage(payload, req.user);
  }

  @Post('workflows')
  @Roles(UserRole.HR_ADMIN)
  async createWorkflow(@Body() payload: CreateApprovalWorkflowDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.createApprovalWorkflow(payload, req.user);
  }

  @Post('encash')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER, UserRole.SYSTEM_ADMIN)
  async encashLeave(@Body() payload: EncashLeaveDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.encashLeave(payload, req.user);
  }

  @Put('balances/adjust')
  @Roles(UserRole.HR_ADMIN)
  async adjustBalance(@Body() adjustmentData: AdjustBalanceDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.manualAdjustBalance(adjustmentData, req.user);
  }

  @Get('reports/irregular')
  @Roles(UserRole.DEPARTMENT_HEAD, UserRole.HR_ADMIN)
  async getIrregularLeaveReport(@Query('managerId') managerId: string) {
    return this.leavesService.getIrregularLeaveReport(managerId);
  }

  @Get('requests/employee/:employeeId')
  @Roles(UserRole.DEPARTMENT_EMPLOYEE, UserRole.HR_ADMIN, UserRole.DEPARTMENT_HEAD)
  async getRequestsByEmployee(@Param('employeeId') employeeId: string) {
    return this.leavesService.getRequestsByEmployee(employeeId);
  }

  @Get('team/:managerId')
  @Roles(UserRole.DEPARTMENT_HEAD, UserRole.HR_ADMIN)
  async getTeamLeaves(@Param('managerId') managerId: string, @Query() query?: GetRequestsFilterDto) {
    return this.leavesService.getTeamLeaves(managerId, query);
  }

  @Get('request')
  async getRequests(@Query() query?: GetRequestsFilterDto) {
    return this.leavesService.getRequests(query || {});
  }

  @Get('request/:id')
  async getRequestById(@Param('id') requestId: string) {
    return this.leavesService.getRequestById(requestId);
  }

  @Post('bulk-review')
  async bulkReview(@Body() bulkReviewData: BulkReviewDto) {
    return this.leavesService.bulkReview(bulkReviewData);
  }

  @Post('request/:id/attachments')
  async addAttachment(@Param('id') requestId: string, @Body() attachmentData: AttachmentDto) {
    return this.leavesService.addAttachment(requestId, attachmentData);
  }

  @Put('request/:id/verify-medical')
  async verifyMedicalDocuments(@Param('id') requestId: string, @Body() verificationData: VerifyMedicalDto) {
    return this.leavesService.verifyMedicalDocuments(requestId, verificationData);
  }

  @Put('request/:id/flag')
  async flagLeaveRequest(@Param('id') requestId: string, @Body() flagData: FlagLeaveDto) {
    return this.leavesService.flagLeaveRequest(requestId, flagData);
  }
}
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
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { LeavesService } from './leaves.service';
import { JwtAuthGuard } from '../auth/authorization/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/authorization/guards/roles.guard';
import { Roles } from '../auth/authorization/decorators/roles.decorators';
import { UserRole } from '../auth/authorization/constants/roles.constant';
import { AuthUser } from '../auth/authorization/interfaces/auth-user.interface';

import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { ReviewRequestDto } from './dto/review-request.dto';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { DelegateApprovalDto } from './dto/delegate-approval.dto';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { AssignVacationPackageDto } from './dto/assign-vacation-package.dto';
import { EncashLeaveDto } from './dto/encash-leave.dto';
import { CreateApprovalWorkflowDto } from './dto/create-approval-workflow.dto';
import { AttachmentDto } from './dto/attachment.dto';
import { VerifyMedicalDto } from './dto/verify-medical.dto';
import { FlagLeaveDto } from './dto/flag-leave.dto';
import { BulkReviewDto } from './dto/bulk-review.dto';
import { ModifyLeaveRequestDto } from './dto/modify-leave-request.dto';
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto';

@Controller('leaves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post('request')
  @Roles(UserRole.DEPARTMENT_EMPLOYEE, UserRole.DEPARTMENT_HEAD)
  @UsePipes(new ValidationPipe({ transform: true }))
  async submitRequest(@Body() createRequestDto: CreateLeaveRequestDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.submitRequest(createRequestDto, req.user);
  }

  @Get('balances/:employeeId')
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

  @Put('request/:id/review')
  @Roles(UserRole.DEPARTMENT_HEAD, UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  async reviewRequest(
    @Param('id') requestId: string,
    @Body() reviewData: ReviewRequestDto,
    @Req() req: Request & { user?: AuthUser },
  ) {
    return this.leavesService.processReview(requestId, reviewData, req.user);
  }

  @Put('request/:id/modify')
  @Roles(UserRole.DEPARTMENT_EMPLOYEE)
  async modifyRequest(
    @Param('id') requestId: string,
    @Body() body: ModifyLeaveRequestDto,
    @Req() req: Request & { user?: AuthUser },
  ) {
    return this.leavesService.modifyRequest(requestId, body, req.user);
  }

  @Put('request/:id/cancel')
  @Roles(UserRole.DEPARTMENT_EMPLOYEE, UserRole.HR_ADMIN)
  async cancelRequest(@Param('id') requestId: string, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.cancelRequest(requestId, req.user?.employeeId ?? '');
  }

  @Put('request/:id/delegate')
  @Roles(UserRole.DEPARTMENT_HEAD)
  async delegateApproval(
    @Param('id') requestId: string,
    @Body() body: DelegateApprovalDto,
    @Req() req: Request & { user?: AuthUser },
  ) {
    return this.leavesService.delegateApproval(requestId, body.delegateTo, body.delegatorId ?? req.user?.employeeId, req.user);
  }

  @Post('policies')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  async createPolicy(@Body() policyData: CreateLeavePolicyDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.createPolicy(policyData, req.user);
  }

  @Post('types')
  @Roles(UserRole.HR_ADMIN)
  async createLeaveType(@Body() payload: CreateLeaveTypeDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.createLeaveType(payload, req.user);
  }

  @Get('types')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  async getLeaveTypes() {
    return this.leavesService.getLeaveTypes();
  }

  @Put('types/:id')
  @Roles(UserRole.HR_ADMIN)
  async updateLeaveType(@Param('id') id: string, @Body() payload: Partial<CreateLeaveTypeDto>, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.updateLeaveType(id, payload, req.user);
  }

  @Post('holidays')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  async createHoliday(@Body() payload: CreateHolidayDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.createHoliday(payload, req.user);
  }

  @Post('vacation-packages/assign')
  @Roles(UserRole.HR_ADMIN)
  async assignVacationPackage(@Body() payload: AssignVacationPackageDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.assignVacationPackage(payload, req.user);
  }

  @Post('workflows')
  @Roles(UserRole.HR_ADMIN)
  async createWorkflow(@Body() payload: CreateApprovalWorkflowDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.createApprovalWorkflow(payload, req.user);
  }

  @Post('encash')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER, UserRole.SYSTEM_ADMIN)
  async encashLeave(@Body() payload: EncashLeaveDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.encashLeave(payload, req.user);
  }

  @Put('balances/adjust')
  @Roles(UserRole.HR_ADMIN)
  async adjustBalance(@Body() adjustmentData: AdjustBalanceDto, @Req() req: Request & { user?: AuthUser }) {
    return this.leavesService.manualAdjustBalance(adjustmentData, req.user);
  }

  @Get('reports/irregular')
  @Roles(UserRole.DEPARTMENT_HEAD, UserRole.HR_ADMIN)
  async getIrregularLeaveReport(@Query('managerId') managerId: string) {
    return this.leavesService.getIrregularLeaveReport(managerId);
  }

  @Get('requests/employee/:employeeId')
  @Roles(UserRole.DEPARTMENT_EMPLOYEE, UserRole.HR_ADMIN, UserRole.DEPARTMENT_HEAD)
  async getRequestsByEmployee(@Param('employeeId') employeeId: string) {
    return this.leavesService.getRequestsByEmployee(employeeId);
  }

  @Get('team/:managerId')
  @Roles(UserRole.DEPARTMENT_HEAD, UserRole.HR_ADMIN)
  async getTeamLeaves(@Param('managerId') managerId: string, @Query() query?: any) {
    return this.leavesService.getTeamLeaves(managerId, query);
  }

  @Get('request')
  async getRequests(@Query() query?: any) {
    return this.leavesService.getRequests(query || {});
  }

  @Get('request/:id')
  async getRequestById(@Param('id') requestId: string) {
    return this.leavesService.getRequestById(requestId);
  }

  @Post('bulk-review')
  async bulkReview(@Body() bulkReviewData: BulkReviewDto) {
    return this.leavesService.bulkReview(bulkReviewData);
  }

  @Post('request/:id/attachments')
  async addAttachment(@Param('id') requestId: string, @Body() attachmentData: AttachmentDto) {
    return this.leavesService.addAttachment(requestId, attachmentData);
  }

  @Put('request/:id/verify-medical')
  async verifyMedicalDocuments(@Param('id') requestId: string, @Body() verificationData: VerifyMedicalDto) {
    return this.leavesService.verifyMedicalDocuments(requestId, verificationData);
  }

  @Put('request/:id/flag')
  async flagLeaveRequest(@Param('id') requestId: string, @Body() flagData: FlagLeaveDto) {
    return this.leavesService.flagLeaveRequest(requestId, flagData);
  }
}
import { 
    Controller, 
    Get, 
    Post, 
    Put, 
    Body, 
    Param, 
    UsePipes, 
    ValidationPipe,
    Query 
} from '@nestjs/common';
import { LeavesService } from './leaves.service'; 
// Import DTOs for type safety (you will need to create these files)
// import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
// import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto';

@Controller('leaves') // Base route is /leaves
export class LeavesController {
    import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
    import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto';
  constructor(private readonly leavesService: LeavesService) {}

  // --- 1. Employee Self-Service & Submission ---

  /**
   * POST /leaves/request
   * Handles submission of a new leave request (REQ-015).
   */
  @Post('request')
  @UsePipes(new ValidationPipe({ transform: true })) // Enables validation and automatic transformation
  async submitRequest(@Body() createRequestDto: any /* Replace 'any' with CreateLeaveRequestDto */) { 
    return this.leavesService.submitRequest(createRequestDto);
  }
      async submitRequest(@Body() createRequestDto: CreateLeaveRequestDto) { 
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
  async reviewRequest(
    @Param('id') requestId: string, 
    @Body() reviewData: { 
      async reviewRequest(@Param('id') requestId: string, @Body() reviewData: ReviewRequestDto) {

  // --- 3. HR/System Admin Configuration ---
  
  /**
   * POST /leaves/policies
   * Creates a new standardized leave policy (e.g., Annual, Sick). (REQ-006)
   */
  @Post('policies') 
  async createPolicy(@Body() policyData: any /* Replace 'any' with CreateLeavePolicyDto */) { 
    return this.leavesService.createPolicy(policyData);
  }
      async createPolicy(@Body() policyData: CreateLeavePolicyDto) { 
  /**
   * PUT /leaves/balances/adjust
   * Allows HR Admin to perform manual adjustments (e.g., for audit findings, bulk updates). (REQ-013)
   */
  @Put('balances/adjust')
  async adjustBalance(@Body() adjustmentData: { employeeId: string, typeCode: string, amount: number, justification: string }) {
    // The service must log this action to maintain a full audit trail (BR 17)
    return this.leavesService.manualAdjustBalance(adjustmentData);
      async adjustBalance(@Body() adjustmentData: AdjustBalanceDto) {

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
  @Body() data: { employeeId: string }
) {
  return this.leavesService.cancelRequest(requestId, data.employeeId);
}

// Add these endpoints to your existing LeavesController

@Post('bulk-review')
async bulkReview(@Body() bulkReviewData: {
  requestIds: string[];
  approverId: string;
  action: 'APPROVE' | 'REJECT';
  isHR: boolean;
  comments?: string;
}) {
  return this.leavesService.bulkReview(bulkReviewData);
}

@Post('request/:id/attachments')
async addAttachment(
  @Param('id') requestId: string,
  @Body() attachmentData: {
    fileUrl: string;
    fileName: string;
    fileType: string;
    uploadedBy: string;
  }
) {
  return this.leavesService.addAttachment(requestId, attachmentData);
}

@Put('request/:id/verify-medical')
async verifyMedicalDocuments(
  @Param('id') requestId: string,
  @Body() verificationData: {
    verifiedBy: string;
    isValid: boolean;
    comments?: string;
  }
) {
  return this.leavesService.verifyMedicalDocuments(requestId, verificationData);
}

@Put('request/:id/flag')
async flagLeaveRequest(
  @Param('id') requestId: string,
  @Body() flagData: {
    flaggedBy: string;
    reason: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
  }
) {
  return this.leavesService.flagLeaveRequest(requestId, flagData);
}

// In your leaves.controller.ts
@Post('encash/:id')
async encashLeave(
    @Param('id') requestId: string,
    @Body() encashData: { dailySalaryRate: number }
) {
    return this.leavesService.encashLeave({
        requestId,
        dailySalaryRate: encashData.dailySalaryRate
    });
}


}