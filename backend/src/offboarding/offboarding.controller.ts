import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccessRevocationDto } from './dto/access-revocation.dto';
import { ClearanceChecklistTemplateDto } from './dto/clearance-checklist-template.dto';
import { ClearanceInstanceDto } from './dto/clearance-instance.dto';
import { ExitSettlementNotificationDto } from './dto/exit-settlement-notification.dto';
import { ExitSettlementPreviewDto } from './dto/exit-settlement-preview.dto';
import { CreateResignationRequestDto } from './dto/create-resignation-request.dto';
import { InitiateTerminationReviewDto } from './dto/initiate-termination-review.dto';
import { ResignationRequestListItemDto } from './dto/resignation-request-list-item.dto';
import { ResignationRequestStatusDto } from './dto/resignation-request-status.dto';
import { TerminationReviewDetailDto } from './dto/termination-review-detail.dto';
import { TerminationReviewSummaryDto } from './dto/termination-review-summary.dto';
import { OffboardingService } from './offboarding.service';

import {
  JwtAuthGuard,
  RolesGuard,
  Permissions,
  Permission,
} from '../auth';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('offboarding')
export class OffboardingController {
  constructor(private readonly offboardingService: OffboardingService) {}

  // ----- Termination reviews (HR / managers) -----

  @Permissions(Permission.MANAGE_LEAVES)
  @Post('termination-reviews')
  initiateTerminationReview(
    @Body() dto: InitiateTerminationReviewDto,
  ): Promise<TerminationReviewDetailDto> {
    return this.offboardingService.initiateTerminationReview(dto);
  }

  @Permissions(Permission.MANAGE_LEAVES)
  @Get('termination-reviews/:id')
  getTerminationReviewById(
    @Param('id') id: string,
  ): Promise<TerminationReviewDetailDto> {
    return this.offboardingService.getTerminationReviewById(id);
  }

  @Permissions(Permission.MANAGE_LEAVES)
  @Get('termination-reviews')
  listPendingTerminationReviews(
    @Query('status') status?: string,
  ): Promise<TerminationReviewSummaryDto[]> {
    return this.offboardingService.listPendingTerminationReviews(status);
  }

  // ----- Resignations (employee + HR) -----

  // Employee can submit; HR can also do it on behalf (MANAGE_LEAVES)
  @Permissions(Permission.REQUEST_LEAVE, Permission.MANAGE_LEAVES)
  @Post('resignations')
  createResignation(
    @Body() dto: CreateResignationRequestDto,
  ): Promise<ResignationRequestStatusDto> {
    return this.offboardingService.createResignationRequest(dto);
  }

  @Permissions(Permission.REQUEST_LEAVE, Permission.MANAGE_LEAVES)
  @Get('resignations/:id')
  getResignationById(
    @Param('id') id: string,
  ): Promise<ResignationRequestStatusDto> {
    return this.offboardingService.getResignationRequestById(id);
  }

  @Permissions(Permission.REQUEST_LEAVE, Permission.MANAGE_LEAVES)
  @Get('employees/:employeeId/resignations')
  getEmployeeResignations(
    @Param('employeeId') employeeId: string,
  ): Promise<ResignationRequestListItemDto[]> {
    return this.offboardingService.getEmployeeResignationRequests(employeeId);
  }

  // ----- Clearance workflows (HR) -----

  @Permissions(Permission.MANAGE_LEAVES)
  @Post('clearance-templates')
  createClearanceChecklistTemplate(
    @Body() dto: ClearanceChecklistTemplateDto,
  ): ClearanceChecklistTemplateDto {
    return this.offboardingService.createClearanceChecklistTemplate(dto);
  }

  @Permissions(Permission.MANAGE_LEAVES)
  @Post('termination/:terminationId/clearance')
  instantiateClearance(
    @Param('terminationId') terminationId: string,
    @Body('employeeId') employeeId: string,
  ): Promise<ClearanceInstanceDto> {
    return this.offboardingService.instantiateClearanceForTermination(
      terminationId,
      employeeId,
    );
  }

  @Permissions(Permission.MANAGE_LEAVES)
  @Get('clearance/employee/:employeeId')
  getClearanceByEmployee(
    @Param('employeeId') employeeId: string,
  ): Promise<ClearanceInstanceDto | null> {
    return this.offboardingService.getClearanceInstanceByEmployee(employeeId);
  }

  @Permissions(Permission.MANAGE_LEAVES)
  @Get('clearance/:id')
  getClearanceById(
    @Param('id') id: string,
  ): Promise<ClearanceInstanceDto> {
    return this.offboardingService.getClearanceInstanceById(id);
  }

  @Permissions(Permission.MANAGE_LEAVES)
  @Patch('clearance/:instanceId/items/:itemId')
  updateClearanceItem(
    @Param('instanceId') instanceId: string,
    @Param('itemId') itemId: string,
    @Body('status') status: string,
    @Body('remarks') remarks?: string,
  ): Promise<ClearanceInstanceDto> {
    return this.offboardingService.updateClearanceItemStatus(
      instanceId,
      itemId,
      status,
      remarks,
    );
  }

  // ----- Access revocation (HR / IT) -----

  @Permissions(Permission.MANAGE_LEAVES)
  @Post('access-revocation')
  revokeAccess(@Body() dto: AccessRevocationDto): Promise<void> {
    return this.offboardingService.revokeSystemAccess(
      dto.employeeId,
      dto.terminationEffectiveDate,
      dto.reasons,
    );
  }

  // ----- Exit settlement / payroll (HR + Payroll) -----

  @Permissions(Permission.MANAGE_LEAVES, Permission.MANAGE_PAYROLL)
  @Get('settlements/:employeeId/preview')
  getExitSettlementPreview(
    @Param('employeeId') employeeId: string,
  ): Promise<ExitSettlementPreviewDto> {
    return this.offboardingService.buildExitSettlementPreview(employeeId);
  }

  @Permissions(Permission.MANAGE_LEAVES, Permission.MANAGE_PAYROLL)
  @Post('settlements/:employeeId/notify-payroll')
  notifyPayrollForSettlement(
    @Param('employeeId') employeeId: string,
  ): Promise<ExitSettlementNotificationDto> {
    return this.offboardingService.sendExitSettlementNotification(employeeId);
  }
}
