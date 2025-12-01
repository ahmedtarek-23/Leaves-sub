import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
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
import { UpdateJobRequisitionDto } from './dto/update-job-requisition.dto';
import { JobTemplateFiltersDto } from './dto/job-template-filters.dto';
import { JobRequisitionFiltersDto } from './dto/job-requisition-filters.dto';
import { CareersPageJobPreviewDto } from './dto/careers-page-job-preview.dto';
import { PublishJobRequisitionDto } from './dto/publish-job-requisition.dto';
import { CandidateApplicationStatusDto } from './dto/candidate-application-status.dto';
import { ApplicationStatusHistoryDto } from './dto/application-status-history.dto';
import { SendRejectionNotificationDto } from './dto/send-rejection-notification.dto';
import { RejectionNotificationTemplateDto } from './dto/rejection-notification-template.dto';
import { RescheduleInterviewDto } from './dto/reschedule-interview.dto';
import {
  AssessmentFormConfigDto,
  SubmitInterviewFeedbackDto,
} from './dto/submit-interview-feedback.dto';
import { TagReferralApplicationDto } from './dto/tag-referral-application.dto';
import { PositionAnalyticsDto } from './dto/position-analytics.dto';
import { RecruitmentOverviewAnalyticsDto } from './dto/recruitment-overview-analytics.dto';
import { CandidateConsentDto } from './dto/candidate-consent.dto';
import { UpdateOfferApprovalStatusDto } from './dto/update-offer-approval-status.dto';
import { SendOfferDto } from './dto/send-offer.dto';
import { JobTemplate, JobTemplateDocument } from './models/job-template.schema';
import {
  JobRequisition,
  JobRequisitionDocument,
} from './models/job-requisition.schema';
import { Application, ApplicationDocument } from './models/application.schema';
import {
  ApplicationStatusHistory,
  ApplicationStatusHistoryDocument,
} from './models/application-history.schema';
import { Interview, InterviewDocument } from './models/interview.schema';
import {
  AssessmentResult,
  AssessmentResultDocument,
} from './models/assessment-result.schema';
import { Offer, OfferDocument } from './models/offer.schema';
import { ApplicationStatus } from './enums/application-status.enum';
import { ApplicationStage } from './enums/application-stage.enum';
import { InterviewStatus } from './enums/interview-status.enum';
import { OfferFinalStatus } from './enums/offer-final-status.enum';
import { OfferResponseStatus } from './enums/offer-response-status.enum';
import { ApprovalStatus } from './enums/approval-status.enum';
import { RequisitionPublishStatus } from './dto/update-requisition-status.dto';
import { OnboardingService } from '../onboarding/onboarding.service';

@Injectable()
export class RecruitmentService {
  constructor(
    @InjectModel(JobTemplate.name)
    private readonly jobTemplateModel: Model<JobTemplateDocument>,
    @InjectModel(JobRequisition.name)
    private readonly jobRequisitionModel: Model<JobRequisitionDocument>,
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,
    @InjectModel(ApplicationStatusHistory.name)
    private readonly applicationHistoryModel: Model<ApplicationStatusHistoryDocument>,
    @InjectModel(Interview.name)
    private readonly interviewModel: Model<InterviewDocument>,
    @InjectModel(AssessmentResult.name)
    private readonly assessmentResultModel: Model<AssessmentResultDocument>,
    @InjectModel(Offer.name)
    private readonly offerModel: Model<OfferDocument>,
    private readonly onboardingService: OnboardingService,
  ) {}

  /*Job Templates*/
  async createJobTemplate(dto: CreateJobTemplateDto): Promise<JobTemplate> {
    // TODO[INTEGRATION]: Validate department against Organizational Structure service before creating template.
    // Requirement: REC-003, BR-2
    // Depends on: Organization Structure module (departments/positions/locations).
    return this.jobTemplateModel.create(dto);
  }

  async getJobTemplates(filter?: JobTemplateFiltersDto): Promise<JobTemplate[]> {
    const query: FilterQuery<JobTemplateDocument> = {};
    if (filter?.department) {
      query.department = filter.department;
    }
    if (filter?.title) {
      query.title = { $regex: filter.title, $options: 'i' } as any;
    }

    return this.jobTemplateModel.find(query).lean();
  }

  async getJobTemplateById(id: string): Promise<JobTemplate> {
    const template = await this.jobTemplateModel.findById(id).lean();
    if (!template) {
      throw new NotFoundException('Job template not found');
    }
    return template;
  }

  async updateJobTemplate(
    id: string,
    dto: UpdateJobTemplateDto,
  ): Promise<JobTemplate> {
    const template = await this.jobTemplateModel.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    });

    if (!template) {
      throw new NotFoundException('Job template not found');
    }

    return template;
  }

  /**
   * Job Requisitions
   */
  async createJobRequisition(
    dto: CreateJobRequisitionDto,
  ): Promise<JobRequisition> {
    const existing = await this.jobRequisitionModel
      .findOne({ requisitionId: dto.requisitionId })
      .lean();
    if (existing) {
      throw new BadRequestException('Requisition ID already exists');
    }

    const template = dto.templateId
      ? await this.jobTemplateModel.findById(dto.templateId)
      : null;

    if (dto.templateId && !template) {
      throw new NotFoundException('Job template not found');
    }

    if (!dto.location) {
      throw new BadRequestException('Job requisition requires a location');
    }

    // TODO[SCHEMA]: JobRequisition schema currently lacks title/department/qualification/skill fields required by BR-2.
    // Requirement: REC-003, BR-2

    // TODO[INTEGRATION]: Validate department against Organizational Structure service.
    // Requirement: REC-003, BR-2
    // Depends on: Organization Structure module (departments, positions, locations, pay grades).

    return this.jobRequisitionModel.create({
      requisitionId: dto.requisitionId,
      templateId: template?._id,
      openings: dto.openings,
      location: dto.location,
      hiringManagerId: new Types.ObjectId(dto.hiringManagerId),
      publishStatus: RequisitionPublishStatus.DRAFT,
      postingDate: dto.postingDate,
      expiryDate: dto.expiryDate,
    });
  }

  async getJobRequisitions(
    filter?: JobRequisitionFiltersDto,
  ): Promise<JobRequisition[]> {
    const query: FilterQuery<JobRequisitionDocument> = {};
    if (filter?.publishStatus) {
      query.publishStatus = filter.publishStatus;
    }
    if (filter?.location) {
      query.location = filter.location;
    }
    if (filter?.hiringManagerId) {
      query.hiringManagerId = new Types.ObjectId(filter.hiringManagerId);
    }

    return this.jobRequisitionModel.find(query).lean();
  }

  async getJobRequisitionById(id: string): Promise<JobRequisition> {
    const requisition = await this.jobRequisitionModel.findById(id).lean();
    if (!requisition) {
      throw new NotFoundException('Job requisition not found');
    }
    return requisition;
  }

  async previewJobRequisition(id: string): Promise<CareersPageJobPreviewDto> {
    const requisition = await this.jobRequisitionModel.findById(id).lean();
    if (!requisition) {
      throw new NotFoundException('Job requisition not found');
    }

    const template = requisition.templateId
      ? await this.jobTemplateModel.findById(requisition.templateId).lean()
      : null;

    // TODO[SCHEMA]: Requirement REC-023 references employer-brand content fields that are not present in JobRequisition schema. Using existing fields only.

    return {
      requisitionId: requisition.requisitionId,
      title: template?.title,
      department: template?.department,
      location: requisition.location,
      openings: requisition.openings,
      qualifications: template?.qualifications,
      skills: template?.skills,
      description: template?.description,
      postingDate: requisition.postingDate,
      expiryDate: requisition.expiryDate,
      publishStatus: requisition.publishStatus as RequisitionPublishStatus,
    };
  }

  async updateJobRequisition(
    id: string,
    dto: UpdateJobRequisitionDto,
  ): Promise<JobRequisition> {
    const requisition = await this.jobRequisitionModel.findById(id);
    if (!requisition) {
      throw new NotFoundException('Job requisition not found');
    }

    if (requisition.publishStatus !== RequisitionPublishStatus.DRAFT) {
      throw new BadRequestException(
        'Only draft requisitions can be updated before publishing',
      );
    }

    const template = dto.templateId
      ? await this.jobTemplateModel.findById(dto.templateId)
      : null;
    if (dto.templateId && !template) {
      throw new NotFoundException('Job template not found');
    }

    const location = dto.location ?? requisition.location;
    const openings = dto.openings ?? requisition.openings;

    if (!location || !openings) {
      throw new BadRequestException(
        'Job requisition must maintain required job details (location, openings)',
      );
    }

    // TODO[SCHEMA]: JobRequisition schema currently lacks title/department/qualification/skill fields required by BR-2.
    // Requirement: REC-003, BR-2

    requisition.templateId = template?._id ?? requisition.templateId;
    requisition.openings = openings;
    requisition.location = location;
    requisition.hiringManagerId =
      dto.hiringManagerId !== undefined
        ? new Types.ObjectId(dto.hiringManagerId)
        : requisition.hiringManagerId;
    requisition.postingDate = dto.postingDate ?? requisition.postingDate;
    requisition.expiryDate = dto.expiryDate ?? requisition.expiryDate;

    return requisition.save();
  }

  async publishJobRequisition(
    id: string,
    dto?: PublishJobRequisitionDto,
  ): Promise<JobRequisition> {
    const requisition = await this.jobRequisitionModel.findById(id);
    if (!requisition) {
      throw new NotFoundException('Job requisition not found');
    }

    // TODO[SCHEMA]: Requirement REC-023 / BR-6 assumes an "approved" state for requisitions, but schema does not explicitly enforce it.
    if (requisition.publishStatus !== RequisitionPublishStatus.DRAFT) {
      throw new BadRequestException('Only draft requisitions can be published');
    }

    requisition.publishStatus = RequisitionPublishStatus.PUBLISHED;
    requisition.postingDate = dto?.postingDate ?? requisition.postingDate ?? new Date();
    requisition.expiryDate = dto?.expiryDate ?? requisition.expiryDate;

    // TODO[INTEGRATION]: Push published job requisition to external careers page / CMS.
    // Requirement: REC-023, BR-6
    // Depends on: External careers portal integration to receive job details.

    // TODO[INTEGRATION]: Push published job requisition to internal careers site or employee portal.
    // Requirement: REC-023, BR-6
    // Depends on: Internal careers experience for employees.

    return requisition.save();
  }

  /**
   * Applications
   */
  async applyToJob(dto: ApplyToJobDto): Promise<Application> {
    const requisition = await this.jobRequisitionModel
      .findById(dto.requisitionId)
      .lean();
    if (!requisition) {
      throw new NotFoundException('Job requisition not found');
    }

    if (requisition.publishStatus !== RequisitionPublishStatus.PUBLISHED) {
      // TODO[SCHEMA]: REC-007 / BR-12 ideally enforces apply-only-on-published requisitions; schema only provides publishStatus string.
      throw new BadRequestException('Job requisition is not open for applications');
    }

    if (dto.consentToDataProcessing !== true) {
      // Requirement: REC-028, BR-28, NFR-33 – consent is mandatory before storing applications in the talent pool.
      throw new BadRequestException('Consent required before applying to a job');
    }

    await this.recordCandidateConsent({
      candidateId: dto.candidateId,
      consentToDataProcessing: dto.consentToDataProcessing,
      consentToBackgroundChecks: dto.consentToBackgroundChecks,
    });

    // TODO[INTEGRATION]: Validate candidate existence against Candidate/Employee Profile subsystem.
    // Requirement: REC-007, BR-12
    // Depends on: Candidate profile service to confirm applicant identity and details.

    const candidateObjectId = new Types.ObjectId(dto.candidateId);
    const requisitionObjectId = new Types.ObjectId(dto.requisitionId);

    const duplicateApplication = await this.applicationModel
      .findOne({ candidateId: candidateObjectId, requisitionId: requisitionObjectId })
      .lean();
    if (duplicateApplication) {
      throw new ConflictException('Application already exists for this candidate and requisition');
    }

    // TODO[SCHEMA]: BR-12 requires associating resume/CV with applications, but Application schema has no resume field.
    // Ignoring dto.resumeDocumentId for persistence until schema support exists.

    const application = await this.applicationModel.create({
      candidateId: candidateObjectId,
      requisitionId: requisitionObjectId,
      assignedHr: dto.assignedHr ? new Types.ObjectId(dto.assignedHr) : undefined,
      currentStage: ApplicationStage.SCREENING,
      status: ApplicationStatus.SUBMITTED,
    });

    await this.applicationHistoryModel.create({
      applicationId: application._id,
      oldStage: undefined,
      newStage: ApplicationStage.SCREENING,
      oldStatus: undefined,
      newStatus: ApplicationStatus.SUBMITTED,
      changedBy: candidateObjectId,
    });

    // TODO[INTEGRATION]: Expose talent pool search/filter capabilities over applications and candidates.
    // Requirement: REC-007, BR-12.

    await this.notifyCandidateOnStatusChange(application, {
      newStage: application.currentStage,
      newStatus: application.status,
    });

    await this.notifyRecruiterAndManagerOnStatusChange(application, {
      newStage: application.currentStage,
      newStatus: application.status,
    });

    return application;
  }

  async recordCandidateConsent(dto: CandidateConsentDto): Promise<void> {
    // TODO[INTEGRATION]: Validate candidate existence against Candidate/Employee Profile subsystem before recording consent.
    // Requirement: REC-028, BR-28, NFR-33

    if (dto.consentToDataProcessing !== true) {
      throw new BadRequestException(
        'Consent to data processing must be provided for compliance requirements',
      );
    }

    // TODO[SCHEMA]: REC-028 / BR-28 / NFR-33 require persisting consent decisions and timestamps, but current Candidate schema
    // does not expose consent fields. Skipping persistence until schema support is available.

    // TODO[COMPLIANCE]: Implement consent withdrawal, retention policies, and audit logging for GDPR/labor-law compliance.

    // TODO[INTEGRATION]: Before initiating background checks for this candidate, verify consentToBackgroundChecks is granted.
    // Requirement: REC-028, BR-28, NFR-33.
  }

  async updateApplicationStatus(
    id: string,
    dto: UpdateApplicationStatusDto,
  ): Promise<Application> {
    const application = await this.applicationModel.findById(id);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (!dto.currentStage && !dto.status) {
      throw new BadRequestException(
        'currentStage or status must be provided to update application',
      );
    }

    if (dto.currentStage) {
      const allowedStages = Object.values(ApplicationStage);
      if (!allowedStages.includes(dto.currentStage)) {
        throw new BadRequestException('Invalid application stage');
      }
    }

    if (dto.status) {
      const allowedStatuses = Object.values(ApplicationStatus);
      if (!allowedStatuses.includes(dto.status)) {
        throw new BadRequestException('Invalid application status');
      }
    }

    const historyEntry: Partial<ApplicationStatusHistory> = {
      applicationId: application._id,
      oldStage: application.currentStage,
      newStage: dto.currentStage ?? application.currentStage,
      oldStatus: application.status,
      newStatus: dto.status ?? application.status,
      changedBy: new Types.ObjectId(dto.changedBy),
    };

    if (dto.currentStage) application.currentStage = dto.currentStage;
    if (dto.status) application.status = dto.status;

    await this.applicationHistoryModel.create(historyEntry);
    const updated = await application.save();

    if (dto.status === ApplicationStatus.REJECTED) {
      await this.sendRejectionNotification(updated, {
        changedBy: dto.changedBy,
        rejectionReason: 'Application status set to rejected',
        templateKey: undefined,
      });
    }

    await this.notifyCandidateOnStatusChange(updated, {
      newStage: dto.currentStage,
      newStatus: dto.status,
    });

    await this.notifyRecruiterAndManagerOnStatusChange(updated, {
      newStage: dto.currentStage,
      newStatus: dto.status,
    });

    return updated;
  }

  async updateApplicationStage(
    id: string,
    dto: UpdateApplicationStageDto,
  ): Promise<Application> {
    const application = await this.applicationModel.findById(id);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // TODO[INTEGRATION]: Requirement stages (Screening → Shortlisting → Interview → Offer → Hired)
    // mapped to existing ApplicationStage enum values: screening, department_interview,
    // hr_interview, offer.
    const allowedStages = Object.values(ApplicationStage);
    if (!allowedStages.includes(dto.stage)) {
      throw new BadRequestException('Invalid application stage');
    }

    const historyEntry: Partial<ApplicationStatusHistory> = {
      applicationId: application._id,
      oldStage: application.currentStage,
      newStage: dto.stage,
      oldStatus: application.status,
      newStatus: application.status,
      changedBy: new Types.ObjectId(dto.changedBy),
    };

    application.currentStage = dto.stage;

    await this.applicationHistoryModel.create(historyEntry);
    const updated = await application.save();

    await this.notifyCandidateOnStatusChange(updated, { newStage: dto.stage });
    await this.notifyRecruiterAndManagerOnStatusChange(updated, {
      newStage: dto.stage,
      newStatus: application.status,
    });

    // TODO[SCHEMA]: Application progress percentage is not stored in schema; cannot persist progress value.
    return updated;
  }

  async rejectApplication(
    applicationId: string,
    dto: SendRejectionNotificationDto,
  ): Promise<Application> {
    const application = await this.applicationModel.findById(applicationId);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status === ApplicationStatus.HIRED) {
      // Requirement: REC-022. Prevent changing final hired applications.
      throw new BadRequestException('Cannot reject an application already hired');
    }

    if (application.status === ApplicationStatus.REJECTED) {
      // Requirement: REC-022. Avoid duplicate rejection notifications.
      throw new BadRequestException('Application is already rejected');
    }

    const historyEntry: Partial<ApplicationStatusHistory> = {
      applicationId: application._id,
      oldStage: application.currentStage,
      newStage: application.currentStage,
      oldStatus: application.status,
      newStatus: ApplicationStatus.REJECTED,
      changedBy: new Types.ObjectId(dto.changedBy),
    };

    application.status = ApplicationStatus.REJECTED;

    await this.applicationHistoryModel.create(historyEntry);
    const updated = await application.save();

    await this.sendRejectionNotification(updated, dto);
    await this.notifyCandidateOnStatusChange(updated, {
      newStatus: ApplicationStatus.REJECTED,
    });
    await this.notifyRecruiterAndManagerOnStatusChange(updated, {
      newStatus: ApplicationStatus.REJECTED,
      newStage: application.currentStage,
    });

    return updated;
  }

  async tagApplicationAsReferral(
    dto: TagReferralApplicationDto,
  ): Promise<Application> {
    const application = await this.applicationModel.findById(dto.applicationId);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // TODO[SCHEMA]: REC-030 / BR-14 / BR-25 require referral flags or source fields on applications.
    // Current Application schema does not include referral-related properties; returning application unchanged.
    void dto.referralId;
    void dto.referralSource;

    return application;
  }

  async getApplicationStageHistory(id: string): Promise<ApplicationStatusHistory[]> {
    const application = await this.applicationModel.findById(id).lean();
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.applicationHistoryModel
      .find({ applicationId: new Types.ObjectId(id) })
      .sort({ createdAt: -1 })
      .lean();
  }

  async getApplication(id: string): Promise<Application> {
    const application = await this.applicationModel.findById(id).lean();
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return application;
  }

  /**
   * Candidate-facing status views
   */
  async getCandidateApplicationsWithStatus(
    candidateId: string,
  ): Promise<CandidateApplicationStatusDto[]> {
    const candidateObjectId = new Types.ObjectId(candidateId);
    const applications = await this.applicationModel
      .find({ candidateId: candidateObjectId })
      .lean();

    if (!applications.length) {
      return [];
    }

    const requisitionIds = Array.from(
      new Set(applications.map((app) => app.requisitionId.toString())),
    ).map((id) => new Types.ObjectId(id));

    const requisitions = await this.jobRequisitionModel
      .find({ _id: { $in: requisitionIds } })
      .lean();
    const requisitionMap = new Map(
      requisitions.map((req) => [req._id.toString(), req]),
    );

    const templateIds = Array.from(
      new Set(
        requisitions
          .map((req) => req.templateId?.toString())
          .filter(Boolean) as string[],
      ),
    ).map((id) => new Types.ObjectId(id));

    const templates = templateIds.length
      ? await this.jobTemplateModel.find({ _id: { $in: templateIds } }).lean()
      : [];
    const templateMap = new Map(templates.map((tpl) => [tpl._id.toString(), tpl]));

    return applications.map((application) => {
      const requisition = requisitionMap.get(
        application.requisitionId.toString(),
      );
      const template = requisition?.templateId
        ? templateMap.get(requisition.templateId.toString())
        : undefined;

      return {
        applicationId: application._id.toString(),
        requisitionId: application.requisitionId.toString(),
        jobTitle: template?.title,
        location: requisition?.location,
        status: application.status,
        stage: application.currentStage,
        lastUpdated:
          (application as any).updatedAt || (application as any).createdAt,
        // TODO[INTEGRATION]: Enrich candidate applications with job title from JobRequisition/JobTemplate.
        // Requirement: REC-017, BR-27.
      } as CandidateApplicationStatusDto;
    });
  }

  async getApplicationStatusTimeline(
    applicationId: string,
  ): Promise<ApplicationStatusHistoryDto[]> {
    const application = await this.applicationModel.findById(applicationId).lean();
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const history = await this.applicationHistoryModel
      .find({ applicationId: new Types.ObjectId(applicationId) })
      .sort({ createdAt: 1 })
      .lean();

    return history.map((entry) => ({
      applicationId: entry.applicationId.toString(),
      oldStage: entry.oldStage,
      newStage: entry.newStage,
      oldStatus: entry.oldStatus,
      newStatus: entry.newStatus,
      changedBy: entry.changedBy.toString(),
      changedAt: (entry as any).createdAt,
    }));
  }

  getRejectionNotificationTemplates(): Promise<
    RejectionNotificationTemplateDto[]
  > {
    const templates: RejectionNotificationTemplateDto[] = [
      {
        templateKey: 'default',
        subject: 'Application Update: Thank you for applying',
        body:
          'Thank you for your interest. We appreciate the time you invested in applying. After review, we will not be moving forward at this time.',
        // TODO[SCHEMA]: REC-022 / BR-37 suggest reusable rejection email templates, but schema has no dedicated template entity.
      },
    ];

    return Promise.resolve(templates);
  }

  /**
   * Interviews and assessments
   */
  async scheduleInterview(dto: ScheduleInterviewDto): Promise<Interview> {
    const application = await this.applicationModel.findById(dto.applicationId);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const panelMembers = dto.panelMemberIds ?? [];

    const interview = await this.interviewModel.create({
      applicationId: new Types.ObjectId(dto.applicationId),
      stage: dto.stage,
      scheduledDate: dto.scheduledDate,
      method: dto.method,
      panel: panelMembers.map((member) => new Types.ObjectId(member)),
      calendarEventId: dto.calendarEventId,
      videoLink: dto.videoLink,
      status: InterviewStatus.SCHEDULED,
    });

    if (dto.stage && dto.stage !== application.currentStage) {
      await this.updateApplicationStatus(application.id, {
        changedBy:
          application.assignedHr?.toString() || application.candidateId.toString(),
        currentStage: dto.stage,
      });
    }

    await this.notifyInterviewParticipants(interview, application);

    return interview;
  }

  async rescheduleInterview(
    interviewId: string,
    dto: RescheduleInterviewDto,
  ): Promise<Interview> {
    const interview = await this.interviewModel.findById(interviewId);
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    interview.scheduledDate = dto.scheduledDate;
    interview.calendarEventId = dto.calendarEventId ?? interview.calendarEventId;

    // TODO[SCHEMA]: Interview schema has no explicit reschedule status; keeping status as scheduled.

    const updated = await interview.save();

    const application = await this.applicationModel.findById(interview.applicationId);
    if (application) {
      await this.notifyInterviewParticipants(updated, application);
    }

    return updated;
  }

  async submitInterviewFeedback(
    dto: SubmitInterviewFeedbackDto,
  ): Promise<AssessmentResult> {
    const interview = await this.interviewModel.findById(dto.interviewId);
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    const assessment = await this.assessmentResultModel.create({
      interviewId: new Types.ObjectId(dto.interviewId),
      interviewerId: new Types.ObjectId(dto.submittedBy),
      score: dto.overallRating ?? 0,
      comments: dto.comments,
    });

    interview.feedbackId = assessment._id as unknown as Types.ObjectId;
    interview.status = InterviewStatus.COMPLETED;
    await interview.save();

    // TODO[SCHEMA]: criteriaScores are captured in DTO but not persisted due to schema limitations.

    return assessment;
  }

  async getAssessmentFormForRole(): Promise<AssessmentFormConfigDto> {
    // TODO[SCHEMA]: REC-020 / BR-21 / BR-23 configurable assessment forms are not modeled.
    return {
      criteria: [
        { key: 'communication', label: 'Communication' },
        { key: 'role_fit', label: 'Role Fit' },
      ],
    };
  }

  async recordAssessment(dto: RecordAssessmentDto): Promise<AssessmentResult> {
    const interview = await this.interviewModel.findById(dto.interviewId);
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    const assessment = await this.assessmentResultModel.create({
      interviewId: new Types.ObjectId(dto.interviewId),
      interviewerId: new Types.ObjectId(dto.interviewerId),
      score: dto.score,
      comments: dto.comments,
    });

    interview.feedbackId = assessment._id as unknown as Types.ObjectId;
    interview.status = InterviewStatus.COMPLETED;
    await interview.save();

    return assessment;
  }

  /**
   * Offers
   */
  async createOffer(dto: CreateOfferDto): Promise<Offer> {
    const application = await this.applicationModel.findById(dto.applicationId);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const candidateObjectId = dto.candidateId
      ? new Types.ObjectId(dto.candidateId)
      : (application.candidateId as Types.ObjectId);
    if (
      application.candidateId &&
      dto.candidateId &&
      application.candidateId.toString() !== dto.candidateId
    ) {
      throw new BadRequestException(
        'Candidate does not match the application for this offer',
      );
    }

    const duplicateOffer = await this.offerModel
      .findOne({ applicationId: application._id })
      .lean();
    if (duplicateOffer) {
      throw new ConflictException('An offer already exists for this application');
    }

    // TODO[SCHEMA]: REC-018 / BR-26(a,d) require rich, customizable offer letter data (compensation, benefits, terms).
    // Using existing Offer fields only.

    const offer = await this.offerModel.create({
      applicationId: new Types.ObjectId(dto.applicationId),
      candidateId: candidateObjectId,
      hrEmployeeId: dto.hrEmployeeId
        ? new Types.ObjectId(dto.hrEmployeeId)
        : undefined,
      grossSalary: dto.grossSalary,
      signingBonus: dto.signingBonus,
      benefits: dto.benefits,
      conditions: dto.conditions,
      insurances: dto.insurances,
      content: dto.content,
      role: dto.role,
      deadline: dto.deadline,
      approvers: dto.approvers?.map((approver) => ({
        ...approver,
        employeeId: new Types.ObjectId(approver.employeeId),
        status: approver.status ?? ApprovalStatus.PENDING,
      })),
    });

    // Move application to offer stage
    if (application.currentStage !== ApplicationStage.OFFER) {
      await this.updateApplicationStatus(application.id, {
        changedBy:
          dto.hrEmployeeId ||
          application.assignedHr?.toString() ||
          dto.candidateId,
        currentStage: ApplicationStage.OFFER,
        status: ApplicationStatus.OFFER,
      });
    }

    return offer;
  }

  async updateOfferApprovalStatus(
    dto: UpdateOfferApprovalStatusDto,
  ): Promise<Offer> {
    const offer = await this.offerModel.findById(dto.offerId);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const approverId = new Types.ObjectId(dto.approvedBy);
    const approvalStatus = dto.approved
      ? ApprovalStatus.APPROVED
      : ApprovalStatus.REJECTED;

    const existingIndex = Array.isArray(offer.approvers)
      ? offer.approvers.findIndex(
          (entry: any) => entry.employeeId?.toString?.() === approverId.toString(),
        )
      : -1;

    const approvalEntry = {
      employeeId: approverId,
      status: approvalStatus,
      actionDate: new Date(),
      comment: dto.comments,
    } as any;

    if (existingIndex >= 0) {
      offer.approvers[existingIndex] = {
        ...offer.approvers[existingIndex],
        ...approvalEntry,
      };
    } else {
      offer.approvers = [...(offer.approvers ?? []), approvalEntry];
    }

    if (dto.approved) {
      offer.finalStatus = OfferFinalStatus.APPROVED;
    } else {
      offer.finalStatus = OfferFinalStatus.REJECTED;
    }

    // TODO[INTEGRATION]: Persist detailed financial/managerial approval trail in Financial module.
    // Requirement: REC-014, BR-26(b).

    return offer.save();
  }

  async sendOfferToCandidate(dto: SendOfferDto): Promise<Offer> {
    const offer = await this.offerModel.findById(dto.offerId);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.finalStatus !== OfferFinalStatus.APPROVED) {
      throw new BadRequestException('Offer must be approved before sending');
    }

    const subject = dto.messageOverride
      ? 'Offer Letter'
      : 'Offer Letter: Next steps for your application';
    const body =
      dto.messageOverride ??
      'Please review the attached offer letter. We look forward to your response.';

    // TODO[INTEGRATION]: Plug into email/e-signature service to send the offer letter.
    // Requirement: REC-018, BR-26(a,c,d), BR-37.
    // Depends on: External communication/notification service and e-signature provider.

    // TODO[SCHEMA]: BR-37 requires storing communication logs (offer send events) in applicant profile.
    // Current schema has no explicit CommunicationLog entity.
    void subject;
    void body;

    return offer.save();
  }

  async respondToOffer(id: string, dto: RespondOfferDto): Promise<Offer> {
    const offer = await this.offerModel.findById(id);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    offer.applicantResponse = dto.applicantResponse;
    if (dto.finalStatus) {
      offer.finalStatus = dto.finalStatus;
    }

    if (dto.applicantResponse === OfferResponseStatus.ACCEPTED) {
      offer.finalStatus = OfferFinalStatus.APPROVED;

      const application = await this.applicationModel.findById(offer.applicationId);
      if (application) {
        await this.updateApplicationStatus(application.id, {
          status: ApplicationStatus.HIRED,
          changedBy:
            offer.hrEmployeeId?.toString() ||
            application.assignedHr?.toString() ||
            offer.candidateId.toString(),
          currentStage: application.currentStage,
        });
      }

      await this.triggerOnboardingForAcceptedOffer(offer);
      // TODO[SCHEMA]: ApplicationStage enum lacks an explicit "hired" stage; retaining existing stage while marking status hired.
    }

    if (dto.applicantResponse === OfferResponseStatus.REJECTED) {
      offer.finalStatus = OfferFinalStatus.REJECTED;
      const application = await this.applicationModel.findById(offer.applicationId);
      if (application) {
        await this.rejectApplication(application.id, {
          changedBy: offer.candidateId.toString(),
          rejectionReason: 'Candidate declined the offer',
          templateKey: dto.finalStatus,
        });
      }
    }

    const savedOffer = await offer.save();

    // TODO[INTEGRATION]: Store communication log for offer response events (BR-37).

    const application = await this.applicationModel.findById(offer.applicationId);
    if (application) {
      await this.notifyCandidateOnStatusChange(application, {
        newStatus: application.status,
        newStage: application.currentStage,
      });
      await this.notifyRecruiterAndManagerOnStatusChange(application, {
        newStatus: application.status,
        newStage: application.currentStage,
      });
    }

    return savedOffer;
  }

  private async triggerOnboardingForAcceptedOffer(
    offer: Offer | OfferDocument,
  ): Promise<void> {
    await this.onboardingService.startOnboardingForAcceptedOffer({
      candidateId: (offer as any).candidateId?.toString?.(),
      applicationId: (offer as any).applicationId?.toString?.(),
      offerId: (offer as any)._id?.toString?.(),
      startDate: (offer as any).deadline,
    });

    // TODO[INTEGRATION]: Extend onboarding trigger with job/department context once schemas expose them.
    // Requirement: REC-029, BR-26(c).
  }

  /**
   * Analytics
   */
  async getRecruitmentOverviewAnalytics(): Promise<RecruitmentOverviewAnalyticsDto> {
    const openRequisitions = await this.jobRequisitionModel
      .find({ publishStatus: { $ne: RequisitionPublishStatus.CLOSED } })
      .lean();

    // TODO[SCHEMA]: REC-009 assumes a clear "approved/open" state; current schema only exposes publishStatus.
    const positions: PositionAnalyticsDto[] = [];
    for (const requisition of openRequisitions) {
      positions.push(await this.getPositionAnalytics(requisition._id.toString()));
    }

    const totalApplications = positions.reduce(
      (sum, pos) => sum + pos.totalApplications,
      0,
    );
    const totalInterviewsScheduled = positions.reduce(
      (sum, pos) => sum + pos.totalInterviewsScheduled,
      0,
    );
    const totalOffersMade = positions.reduce(
      (sum, pos) => sum + pos.totalOffersMade,
      0,
    );
    const totalHires = positions.reduce((sum, pos) => sum + pos.totalHires, 0);

    const avgTimeToHireValues = positions
      .map((p) => p.averageTimeToHireDays)
      .filter((value): value is number => value !== undefined);
    const averageTimeToHireDays =
      avgTimeToHireValues.length > 0
        ?
            avgTimeToHireValues.reduce((sum, v) => sum + v, 0) /
          avgTimeToHireValues.length
        : undefined;

    return {
      totalOpenRequisitions: openRequisitions.length,
      totalApplications,
      totalInterviewsScheduled,
      totalOffersMade,
      totalHires,
      averageTimeToHireDays,
      positions,
    };
  }

  async getPositionAnalytics(
    jobRequisitionId: string,
  ): Promise<PositionAnalyticsDto> {
    const requisition = await this.jobRequisitionModel
      .findById(jobRequisitionId)
      .lean();
    if (!requisition) {
      throw new NotFoundException('Job requisition not found');
    }

    const template = requisition.templateId
      ? await this.jobTemplateModel.findById(requisition.templateId).lean()
      : null;

    const applications = await this.applicationModel
      .find({ requisitionId: requisition._id })
      .lean();
    const applicationIds = applications.map((app) => app._id);

    const applicationsByStageMap = applications.reduce<Record<string, number>>(
      (acc, app) => {
        const stageKey = app.currentStage ?? 'unknown';
        acc[stageKey] = (acc[stageKey] ?? 0) + 1;
        return acc;
      },
      {},
    );
    const applicationsByStage = Object.entries(applicationsByStageMap).map(
      ([stage, count]) => ({ stage, count }),
    );

    const interviews = applicationIds.length
      ? await this.interviewModel
          .find({ applicationId: { $in: applicationIds } })
          .lean()
      : [];
    const totalInterviewsScheduled = interviews.length;
    const totalInterviewsCompleted = interviews.filter(
      (interview) => interview.status === InterviewStatus.COMPLETED,
    ).length;

    const offers = applicationIds.length
      ? await this.offerModel.find({ applicationId: { $in: applicationIds } }).lean()
      : [];
    const totalOffersMade = offers.length;
    const totalOffersAccepted = offers.filter(
      (offer) =>
        offer.finalStatus === OfferFinalStatus.APPROVED ||
        offer.applicantResponse === OfferResponseStatus.ACCEPTED,
    ).length;
    const totalOffersRejected = offers.filter(
      (offer) =>
        offer.finalStatus === OfferFinalStatus.REJECTED ||
        offer.applicantResponse === OfferResponseStatus.REJECTED,
    ).length;

    const hiredApplicationIds = new Set<string>(
      applications
        .filter((app) => app.status === ApplicationStatus.HIRED)
        .map((app) => app._id.toString()),
    );

    const hireHistories = applicationIds.length
      ? await this.applicationHistoryModel
          .find({
            applicationId: { $in: applicationIds },
            newStatus: ApplicationStatus.HIRED,
          })
          .lean()
      : [];
    hireHistories.forEach((history) =>
      hiredApplicationIds.add((history.applicationId as Types.ObjectId).toString()),
    );
    const totalHires = hiredApplicationIds.size;

    // TODO[SCHEMA]: BR-33 precise time-to-hire requires explicit "hired at" timestamps; using createdAt/updatedAt approximations.
    const timeToHireDurations: number[] = [];
    const hireHistoryMap = hireHistories.reduce<Record<string, Date>>((acc, history) => {
      const key = (history.applicationId as Types.ObjectId).toString();
      const createdAtRaw = (history as any).createdAt as Date | string | undefined;
      const createdAt = createdAtRaw ? new Date(createdAtRaw) : undefined;
      if (createdAt && !acc[key]) {
        acc[key] = createdAt;
      }
      return acc;
    }, {});

    applications
      .filter((app) => hiredApplicationIds.has(app._id.toString()))
      .forEach((app) => {
        const startRaw = (app as any).createdAt as Date | string | undefined;
        const endRaw =
          hireHistoryMap[app._id.toString()] || (app as any).updatedAt;
        const start = startRaw ? new Date(startRaw) : undefined;
        const end = endRaw ? new Date(endRaw) : undefined;
        if (start && end) {
          const durationMs = end.getTime() - start.getTime();
          const durationDays = durationMs / (1000 * 60 * 60 * 24);
          if (!Number.isNaN(durationDays) && Number.isFinite(durationDays)) {
            timeToHireDurations.push(durationDays);
          }
        }
      });

    const averageTimeToHireDays =
      timeToHireDurations.length > 0
        ? timeToHireDurations.reduce((sum, v) => sum + v, 0) /
          timeToHireDurations.length
        : undefined;

    // TODO[SCHEMA]: BR-33 source effectiveness requires explicit source fields on applications/referrals.
    const sources = undefined;

    return {
      requisitionId: requisition._id.toString(),
      title: template?.title,
      department: template?.department,
      totalApplications: applications.length,
      applicationsByStage,
      totalInterviewsScheduled,
      totalInterviewsCompleted,
      totalOffersMade,
      totalOffersAccepted,
      totalOffersRejected,
      totalHires,
      averageTimeToHireDays,
      sources,
    };
  }

  private async sendRejectionNotification(
    application: Application | ApplicationDocument,
    dto: SendRejectionNotificationDto,
  ): Promise<void> {
    const requisition = await this.jobRequisitionModel
      .findById((application as any).requisitionId)
      .lean();
    const template =
      dto.templateKey && dto.templateKey !== 'default'
        ? undefined
        : {
            subject: 'Application Update: Thank you for applying',
            body:
              'Thank you for your application. After careful consideration, we will not be moving forward at this time.',
          };

    const roleLabel = requisition?.requisitionId
      ? ` for requisition ${requisition.requisitionId}`
      : '';
    const reasonText = dto.rejectionReason
      ? ` Reason: ${dto.rejectionReason}.`
      : '';

    const message = `${template?.body ?? 'Your application has been declined.'}${roleLabel}.${reasonText}`;

    // TODO[INTEGRATION]: Send rejection email to candidate using template.
    // Requirement: REC-022, BR-36, BR-37.
    // Depends on: External communication/notification service for email/SMS.
    // TODO[INTEGRATION]: Persist communication log in NotificationLog / CommunicationLog linked to Application/Candidate.
    // Requirement: REC-022, BR-37.

    void template;
    void message;
  }

  private async notifyRecruiterAndManagerOnStatusChange(
    application: Application | ApplicationDocument,
    payload: { newStatus?: ApplicationStatus; newStage?: ApplicationStage },
  ): Promise<void> {
    const requisition = await this.jobRequisitionModel
      .findById((application as any).requisitionId)
      .lean();

    const recipients = [
      (application as any).assignedHr?.toString?.(),
      requisition?.hiringManagerId?.toString?.(),
    ].filter(Boolean) as string[];

    if (!recipients.length) {
      return;
    }

    const messageParts: string[] = [];
    if (payload.newStage) {
      messageParts.push(`stage ${payload.newStage}`);
    }
    if (payload.newStatus) {
      messageParts.push(`status ${payload.newStatus}`);
    }
    const description = messageParts.length
      ? messageParts.join(' and ')
      : 'an updated state';

    const message = `Application ${
      (application as any)._id
    } is now in ${description}.`;

    // TODO[INTEGRATION]: Send email / in-app notification to assigned recruiter and hiring manager when application stage/status changes.
    // Requirement: REC-008, BR-11.
    // Depends on: Notification/Communication module for staff alerts.

    void message;
  }

  private async notifyInterviewParticipants(
    interview: Interview | InterviewDocument,
    application: Application | ApplicationDocument,
  ): Promise<void> {
    const panelMembers = (interview as any).panel?.map((id: any) =>
      id.toString(),
    );
    const scheduledDate = (interview as any).scheduledDate;
    const mode = (interview as any).method;

    // TODO[INTEGRATION]: Send calendar invites/notifications to candidate and panel members.
    // Requirement: REC-010, REC-021, BR-19, BR-20.
    // Depends on: Time Management/Calendar subsystem and Notification service.

    // TODO[INTEGRATION]: Validate panel availability before confirming the slot.
    // Requirement: REC-021, BR-19, BR-20.

    void panelMembers;
    void scheduledDate;
    void mode;
    void application;
  }

  /**
   * This helper surfaces status/stage changes to the Candidate Self-Service Portal via
   * downstream notification channels (email/SMS/push) once integrated.
   * Requirement: REC-017, BR-27, BR-36.
   */
  private async notifyCandidateOnStatusChange(
    application: Application | ApplicationDocument,
    payload: { newStatus?: ApplicationStatus; newStage?: ApplicationStage },
  ): Promise<void> {
    const requisitionId = (application as any).requisitionId?.toString?.();
    const messageParts: string[] = [];
    if (payload.newStage) {
      messageParts.push(`stage ${payload.newStage}`);
    }
    if (payload.newStatus) {
      messageParts.push(`status ${payload.newStatus}`);
    }
    const description = messageParts.length
      ? messageParts.join(' and ')
      : 'an updated state';

    const message = `Your application${
      requisitionId ? ` for requisition ${requisitionId}` : ''
    } is now in ${description}.`;

    // TODO[INTEGRATION]: Send email / in-app notification to the candidate when application status/stage changes.
    // Requirement: REC-017, BR-27, BR-36.
    // Depends on: Notification/Communication module (email/SMS/push), Candidate Self-Service Portal.
    // TODO[INTEGRATION]: Real-time delivery (WebSocket/SSE) for live status visualization is out of scope here.

    void message; // placeholder to avoid unused variable linting until integration is wired.
  }
}