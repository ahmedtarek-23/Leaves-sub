import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { CreateOnboardingChecklistDto } from './dto/create-onboarding-checklist.dto';
import { StartOnboardingDto } from './dto/start-onboarding.dto';
import { UploadOnboardingDocumentDto } from './dto/upload-onboarding-document.dto';
import { OnboardingDocumentDto } from './dto/onboarding-document.dto';
import { ProvisioningRequestDto } from './dto/provisioning-request.dto';
import { ProvisioningTaskDto } from './dto/provisioning-task.dto';
import { CancelOnboardingDto } from './dto/cancel-onboarding.dto';

import {
  JwtAuthGuard,
  RolesGuard,
  Permissions,
  Permission,
} from '../auth';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  // HR configuration
  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Post('checklists')
  async createChecklist(@Body() dto: CreateOnboardingChecklistDto) {
    return this.onboardingService.createOnboardingChecklist(dto);
  }

  // Triggered from accepted offer
  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Post('start')
  async startOnboarding(@Body() dto: StartOnboardingDto) {
    return this.onboardingService.startOnboardingForAcceptedOffer(dto);
  }

  // Candidate / HR document handling
  @Permissions(Permission.MANAGE_RECRUITMENT, Permission.VIEW_APPLICATIONS)
  @Post(':onboardingId/documents')
  async uploadDocument(
    @Param('onboardingId') onboardingId: string,
    @Body() dto: UploadOnboardingDocumentDto,
  ): Promise<OnboardingDocumentDto> {
    return this.onboardingService.uploadOnboardingDocument({
      ...dto,
      onboardingId,
    });
  }

  @Permissions(Permission.MANAGE_RECRUITMENT, Permission.VIEW_APPLICATIONS)
  @Get(':onboardingId/documents')
  async getOnboardingDocuments(
    @Param('onboardingId') onboardingId: string,
  ): Promise<OnboardingDocumentDto[]> {
    return this.onboardingService.getOnboardingDocuments(onboardingId);
  }

  @Permissions(Permission.MANAGE_RECRUITMENT, Permission.VIEW_APPLICATIONS)
  @Get('candidates/:candidateId/documents')
  async getCandidateDocuments(
    @Param('candidateId') candidateId: string,
  ): Promise<OnboardingDocumentDto[]> {
    return this.onboardingService.getCandidateDocuments(candidateId);
  }

  // HR verification
  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Patch('documents/:documentId/verify')
  async verifyDocument(
    @Param('documentId') documentId: string,
    @Body('hrUserId') hrUserId: string,
  ): Promise<OnboardingDocumentDto> {
    return this.onboardingService.verifyOnboardingDocument(documentId, hrUserId);
  }

  // Tracker views – new hire & HR
  @Permissions(Permission.MANAGE_RECRUITMENT, Permission.VIEW_APPLICATIONS)
  @Get('candidates/:candidateId/tracker')
  async getTrackerForCandidate(@Param('candidateId') candidateId: string) {
    return this.onboardingService.getOnboardingTrackerForCandidate(candidateId);
  }

  @Permissions(Permission.MANAGE_RECRUITMENT, Permission.VIEW_APPLICATIONS)
  @Get(':onboardingId/tracker')
  async getTrackerById(@Param('onboardingId') onboardingId: string) {
    return this.onboardingService.getOnboardingTrackerById(onboardingId);
  }

  @Permissions(Permission.MANAGE_RECRUITMENT, Permission.VIEW_APPLICATIONS)
  @Patch(':onboardingId/tasks/:taskId/complete')
  async completeTask(
    @Param('onboardingId') onboardingId: string,
    @Param('taskId') taskId: string,
    @Body('actorId') actorId: string,
  ) {
    return this.onboardingService.completeOnboardingTask(
      onboardingId,
      taskId,
      actorId,
    );
  }

  // Provisioning / payroll triggers – HR / IT / facilities
  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Post(':onboardingId/provisioning')
  async createProvisioning(
    @Param('onboardingId') onboardingId: string,
    @Body() dto: ProvisioningRequestDto,
  ): Promise<ProvisioningTaskDto[]> {
    const tasks = await this.onboardingService.createProvisioningTasks(onboardingId);
    if (dto.taskType === 'IT') {
      await this.onboardingService.provisionAccounts(onboardingId);
    }
    if (dto.taskType === 'FACILITIES' || dto.taskType === 'ACCESS') {
      await this.onboardingService.reserveResources(onboardingId);
    }
    return tasks;
  }

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Post(':onboardingId/provision-accounts')
  async provisionAccounts(@Param('onboardingId') onboardingId: string): Promise<void> {
    await this.onboardingService.provisionAccounts(onboardingId);
  }

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Post(':onboardingId/reserve-resources')
  async reserveResources(@Param('onboardingId') onboardingId: string): Promise<void> {
    await this.onboardingService.reserveResources(onboardingId);
  }

  @Permissions(Permission.MANAGE_RECRUITMENT, Permission.MANAGE_PAYROLL)
  @Post(':onboardingId/payroll/initiate')
  async triggerPayroll(@Param('onboardingId') onboardingId: string): Promise<void> {
    await this.onboardingService.triggerPayrollInitiation(onboardingId);
  }

  @Permissions(Permission.MANAGE_RECRUITMENT, Permission.MANAGE_PAYROLL)
  @Post(':onboardingId/payroll/signing-bonus')
  async triggerSigningBonus(
    @Param('onboardingId') onboardingId: string,
  ): Promise<void> {
    await this.onboardingService.triggerSigningBonusProcessing(onboardingId);
  }

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Post(':onboardingId/schedule-access-revocation')
  async scheduleAccessRevocation(@Param('onboardingId') onboardingId: string): Promise<void> {
    await this.onboardingService.scheduleAccessRevocation(onboardingId);
  }

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Patch(':onboardingId/cancel')
  async cancelOnboarding(
    @Param('onboardingId') onboardingId: string,
    @Body() dto: CancelOnboardingDto,
  ) {
    return this.onboardingService.cancelOnboarding(onboardingId, dto.reason);
  }
}
