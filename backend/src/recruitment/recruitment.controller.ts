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
import { RecruitmentService } from './recruitment.service';
import { CreateJobTemplateDto } from './dto/create-job-template.dto';
import { CreateJobRequisitionDto } from './dto/create-job-requisition.dto';
import { ApplyToJobDto } from './dto/apply-to-job.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { UpdateApplicationStageDto } from './dto/update-application-stage.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { RecordAssessmentDto } from './dto/record-assessment.dto';
import { CreateOfferDto } from './dto/create-offer.dto';
import { RespondOfferDto } from './dto/respond-offer.dto';
import { UpdateJobTemplateDto } from './dto/update-job-template.dto';
import { JobTemplateFiltersDto } from './dto/job-template-filters.dto';
import { JobRequisitionFiltersDto } from './dto/job-requisition-filters.dto';
import { UpdateJobRequisitionDto } from './dto/update-job-requisition.dto';
import { PublishJobRequisitionDto } from './dto/publish-job-requisition.dto';
import { CareersPageJobPreviewDto } from './dto/careers-page-job-preview.dto';
import { CandidateApplicationStatusDto } from './dto/candidate-application-status.dto';
import { ApplicationStatusHistoryDto } from './dto/application-status-history.dto';
import { SendRejectionNotificationDto } from './dto/send-rejection-notification.dto';
import { RejectionNotificationTemplateDto } from './dto/rejection-notification-template.dto';
import { RescheduleInterviewDto } from './dto/reschedule-interview.dto';
import { SubmitInterviewFeedbackDto } from './dto/submit-interview-feedback.dto';
import { TagReferralApplicationDto } from './dto/tag-referral-application.dto';
import { PositionAnalyticsDto } from './dto/position-analytics.dto';
import { RecruitmentOverviewAnalyticsDto } from './dto/recruitment-overview-analytics.dto';
import { CandidateConsentDto } from './dto/candidate-consent.dto';
import { UpdateOfferApprovalStatusDto } from './dto/update-offer-approval-status.dto';
import { SendOfferDto } from './dto/send-offer.dto';

// auth / permissions
import {
  JwtAuthGuard,
  RolesGuard,
  Permissions,
  Permission,
  Public,
} from '../auth';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  // -------- Job templates (HR only) --------

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Post('job-templates')
  createTemplate(@Body() dto: CreateJobTemplateDto) {
    return this.recruitmentService.createJobTemplate(dto);
  }

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Get('job-templates')
  listTemplates(@Query() filter: JobTemplateFiltersDto) {
    return this.recruitmentService.getJobTemplates(filter);
  }

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Get('job-templates/:id')
  getTemplate(@Param('id') id: string) {
    return this.recruitmentService.getJobTemplateById(id);
  }

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Patch('job-templates/:id')
  updateTemplate(@Param('id') id: string, @Body() dto: UpdateJobTemplateDto) {
    return this.recruitmentService.updateJobTemplate(id, dto);
  }

  // -------- Job requisitions (HR only) --------

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Post('job-requisitions')
  createRequisition(@Body() dto: CreateJobRequisitionDto) {
    return this.recruitmentService.createJobRequisition(dto);
  }

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Get('job-requisitions')
  listRequisitions(@Query() filter: JobRequisitionFiltersDto) {
    return this.recruitmentService.getJobRequisitions(filter);
  }

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Get('job-requisitions/:id')
  getRequisition(@Param('id') id: string) {
    return this.recruitmentService.getJobRequisitionById(id);
  }

  // This is used by careers page – allow read-only recruitment viewers too
  @Permissions(Permission.MANAGE_RECRUITMENT, Permission.VIEW_APPLICATIONS)
  @Get('job-requisitions/:id/preview')
  previewRequisition(
    @Param('id') id: string,
  ): Promise<CareersPageJobPreviewDto> {
    return this.recruitmentService.previewJobRequisition(id);
  }

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Patch('job-requisitions/:id')
  updateRequisition(
    @Param('id') id: string,
    @Body() dto: UpdateJobRequisitionDto,
  ) {
    return this.recruitmentService.updateJobRequisition(id, dto);
  }

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Patch('job-requisitions/:id/publish')
  publishRequisition(
    @Param('id') id: string,
    @Body() dto: PublishJobRequisitionDto,
  ) {
    return this.recruitmentService.publishJobRequisition(id, dto);
  }

  // -------- Applications --------

  // Public: external candidate can apply without login
  @Public()
  @Post('applications')
  applyToJob(@Body() dto: ApplyToJobDto) {
    return this.recruitmentService.applyToJob(dto);
  }

  // Public: consent is captured as part of application flow
  @Public()
  @Post('candidates/:candidateId/consent')
  recordCandidateConsent(
    @Param('candidateId') candidateId: string,
    @Body() dto: CandidateConsentDto,
  ) {
    return this.recruitmentService.recordCandidateConsent({
      ...dto,
      candidateId,
    });
  }

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Patch('applications/:id/status')
  updateApplicationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.recruitmentService.updateApplicationStatus(id, dto);
  }

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Patch('applications/:id/stage')
  updateApplicationStage(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStageDto,
  ) {
    return this.recruitmentService.updateApplicationStage(id, dto);
  }

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Patch('applications/:id/tag-referral')
  tagReferral(
    @Param('id') id: string,
    @Body() dto: TagReferralApplicationDto,
  ) {
    return this.recruitmentService.tagApplicationAsReferral({
      ...dto,
      applicationId: id,
    });
  }

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Post('applications/:id/reject')
  rejectApplication(
    @Param('id') id: string,
    @Body() dto: SendRejectionNotificationDto,
  ) {
    return this.recruitmentService.rejectApplication(id, dto);
  }

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Get('applications/:id/stage-history')
  getStageHistory(@Param('id') id: string) {
    return this.recruitmentService.getApplicationStageHistory(id);
  }

  @Permissions(Permission.MANAGE_RECRUITMENT, Permission.VIEW_APPLICATIONS)
  @Get('applications/:id')
  getApplication(@Param('id') id: string) {
    return this.recruitmentService.getApplication(id);
  }

  @Permissions(Permission.MANAGE_RECRUITMENT, Permission.VIEW_APPLICATIONS)
  @Get('candidates/:candidateId/applications')
  getCandidateApplications(
    @Param('candidateId') candidateId: string,
  ): Promise<CandidateApplicationStatusDto[]> {
    return this.recruitmentService.getCandidateApplicationsWithStatus(
      candidateId,
    );
  }

  @Permissions(Permission.MANAGE_RECRUITMENT, Permission.VIEW_APPLICATIONS)
  @Get('applications/:id/status-timeline')
  getApplicationStatusTimeline(
    @Param('id') id: string,
  ): Promise<ApplicationStatusHistoryDto[]> {
    return this.recruitmentService.getApplicationStatusTimeline(id);
  }

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Get('communication-templates/rejection')
  getRejectionTemplates(): Promise<RejectionNotificationTemplateDto[]> {
    return this.recruitmentService.getRejectionNotificationTemplates();
  }

  // -------- Analytics (HR only) --------

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Get('analytics/overview')
  getRecruitmentOverview(): Promise<RecruitmentOverviewAnalyticsDto> {
    return this.recruitmentService.getRecruitmentOverviewAnalytics();
  }

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Get('analytics/positions/:jobRequisitionId')
  getPositionAnalytics(
    @Param('jobRequisitionId') jobRequisitionId: string,
  ): Promise<PositionAnalyticsDto> {
    return this.recruitmentService.getPositionAnalytics(jobRequisitionId);
  }

  // -------- Interviews --------

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Post('interviews')
  scheduleInterview(@Body() dto: ScheduleInterviewDto) {
    return this.recruitmentService.scheduleInterview(dto);
  }

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Patch('interviews/:id/reschedule')
  rescheduleInterview(
    @Param('id') id: string,
    @Body() dto: RescheduleInterviewDto,
  ) {
    return this.recruitmentService.rescheduleInterview(id, dto);
  }

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Post('interviews/:id/feedback')
  submitInterviewFeedback(
    @Param('id') interviewId: string,
    @Body() dto: SubmitInterviewFeedbackDto,
  ) {
    return this.recruitmentService.submitInterviewFeedback({
      ...dto,
      interviewId,
    });
  }

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Post('interviews/:id/assessment')
  recordAssessment(
    @Param('id') interviewId: string,
    @Body() dto: RecordAssessmentDto,
  ) {
    return this.recruitmentService.recordAssessment({ ...dto, interviewId });
  }

  // -------- Offers --------

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Post('offers')
  createOffer(@Body() dto: CreateOfferDto) {
    return this.recruitmentService.createOffer(dto);
  }

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Patch('offers/:id/approval')
  updateOfferApproval(
    @Param('id') id: string,
    @Body() dto: UpdateOfferApprovalStatusDto,
  ) {
    return this.recruitmentService.updateOfferApprovalStatus({
      ...dto,
      offerId: id,
    });
  }

  @Permissions(Permission.MANAGE_RECRUITMENT)
  @Post('offers/:id/send')
  sendOffer(@Param('id') id: string, @Body() dto: SendOfferDto) {
    return this.recruitmentService.sendOfferToCandidate({
      ...dto,
      offerId: id,
    });
  }

  // Public: candidate clicks link and responds without logging in
  @Public()
  @Post('offers/:id/respond')
  respondToOffer(@Param('id') id: string, @Body() dto: RespondOfferDto) {
    return this.recruitmentService.respondToOffer(id, dto);
  }
}
