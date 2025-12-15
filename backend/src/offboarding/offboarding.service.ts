import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { ApprovalStatus } from '../recruitment/enums/approval-status.enum';
import { TerminationInitiation } from '../recruitment/enums/termination-initiation.enum';
import { TerminationStatus } from '../recruitment/enums/termination-status.enum';
import {
  TerminationRequest,
  TerminationRequestDocument,
} from '../recruitment/models/termination-request.schema';
import {
  ClearanceChecklist,
  ClearanceChecklistDocument,
} from '../recruitment/models/clearance-checklist.schema';
import { AccessRevocationDto } from './dto/access-revocation.dto';
import { ClearanceChecklistTemplateDto } from './dto/clearance-checklist-template.dto';
import { ClearanceInstanceDto } from './dto/clearance-instance.dto';
import { ClearanceItemDto } from './dto/clearance-item.dto';
import { ExitSettlementNotificationDto } from './dto/exit-settlement-notification.dto';
import { ExitSettlementPreviewDto } from './dto/exit-settlement-preview.dto';
import { InitiateTerminationReviewDto } from './dto/initiate-termination-review.dto';
import { CreateResignationRequestDto } from './dto/create-resignation-request.dto';
import { ResignationRequestListItemDto } from './dto/resignation-request-list-item.dto';
import { ResignationRequestStatusDto } from './dto/resignation-request-status.dto';
import { TerminationReviewDetailDto } from './dto/termination-review-detail.dto';
import { TerminationReviewSummaryDto } from './dto/termination-review-summary.dto';

interface TerminationMetadata {
  requestedById?: string;
  performanceRecordId?: string;
  reasonCode?: string;
  currentStep?: string;
}

@Injectable()
export class OffboardingService {
  private readonly clearanceTemplates: ClearanceChecklistTemplateDto[] = [
    {
      id: 'default',
      name: 'Standard Employee Exit',
      items: [
        { department: 'IT', label: 'Return laptop and accessories' },
        { department: 'FACILITIES', label: 'Return access card / badge' },
        { department: 'FINANCE', label: 'Expense and advance settlement' },
        { department: 'LINE_MANAGER', label: 'Handover of duties' },
        { department: 'HR', label: 'Finalize exit paperwork' },
      ],
    },
  ];

  constructor(
    @InjectModel(TerminationRequest.name)
    private readonly terminationRequestModel: Model<TerminationRequestDocument>,
    @InjectModel(ClearanceChecklist.name)
    private readonly clearanceChecklistModel: Model<ClearanceChecklistDocument>,
  ) {}

  private parseMetadata(raw?: string): TerminationMetadata {
    if (!raw) {
      return {};
    }
    try {
      const parsed = JSON.parse(raw);
      return {
        requestedById: parsed.requestedById,
        performanceRecordId: parsed.performanceRecordId,
        reasonCode: parsed.reasonCode,
        currentStep: parsed.currentStep,
      };
    } catch (err) {
      // TODO[SCHEMA]: OFF-001 lacks dedicated fields for requestedBy/performance context; using hrComments to store metadata.
      return {};
    }
  }

  private buildMetadata(dto: InitiateTerminationReviewDto): string {
    return JSON.stringify({
      requestedById: dto.requestedById,
      performanceRecordId: dto.performanceRecordId,
      reasonCode: dto.reasonCode,
    });
  }

  private buildResignationMetadata(dto: CreateResignationRequestDto): string {
    return JSON.stringify({
      reasonCode: dto.reasonCode,
      currentStep: 'LINE_MANAGER',
    });
  }

  private parseItemComments(raw?: string): {
    label?: string;
    remarks?: string;
  } {
    if (!raw) {
      return {};
    }
    try {
      return JSON.parse(raw);
    } catch {
      // TODO[SCHEMA]: OFF-006 / OFF-010 need dedicated label/remarks fields for clearance items.
      return {};
    }
  }

  private buildItemComments(label: string, remarks?: string): string {
    return JSON.stringify({ label, remarks });
  }

  private mapToDetailDto(
    request: TerminationRequestDocument,
    metadata?: TerminationMetadata,
  ): TerminationReviewDetailDto {
    const meta = metadata ?? this.parseMetadata((request as any).hrComments);
    return {
      id: request._id?.toString?.() ?? '',
      employeeId: request.employeeId?.toString?.() ?? '',
      requestedById: meta?.requestedById,
      effectiveDate: request.terminationDate,
      reasonCode: meta?.reasonCode,
      reasonDescription: request.reason,
      status: request.status,
      performanceRecordId: meta?.performanceRecordId,
      createdAt: (request as any).createdAt,
      updatedAt: (request as any).updatedAt,
    };
  }

  private mapToSummaryDto(request: TerminationRequestDocument): TerminationReviewSummaryDto {
    const meta = this.parseMetadata((request as any).hrComments);
    return {
      id: request._id?.toString?.() ?? '',
      employeeId: request.employeeId?.toString?.() ?? '',
      effectiveDate: request.terminationDate,
      reasonDescription: request.reason,
      status: request.status,
      requestedById: meta.requestedById,
    };
  }

  private mapToResignationStatusDto(
    request: TerminationRequestDocument,
  ): ResignationRequestStatusDto {
    const meta = this.parseMetadata((request as any).hrComments);
    return {
      id: request._id?.toString?.() ?? '',
      employeeId: request.employeeId?.toString?.() ?? '',
      submittedAt: (request as any).createdAt,
      proposedLastWorkingDay:
        request.terminationDate ?? (request as any).createdAt ?? new Date(),
      reasonDescription: request.reason,
      status: request.status,
      currentStep: meta.currentStep,
    };
  }

  private mapToResignationListItemDto(
    request: TerminationRequestDocument,
  ): ResignationRequestListItemDto {
    return {
      id: request._id?.toString?.() ?? '',
      submittedAt: (request as any).createdAt,
      proposedLastWorkingDay:
        request.terminationDate ?? (request as any).createdAt ?? new Date(),
      status: request.status,
    };
  }

  // TODO[INTEGRATION]: Offboarding Approval Workflow
  // - Future steps will approve/reject termination reviews.
  // - Approved reviews will trigger access revocation, payroll adjustments, and exit tasks.

  private async validatePerformanceContext(performanceRecordId?: string): Promise<void> {
    if (!performanceRecordId) {
      return;
    }
    // TODO[INTEGRATION]: OFF-001 – verify performance record/warning in Performance Management (PM) module.
  }

  // OFF-018 – employee-initiated resignation request creation.
  async createResignationRequest(
    dto: CreateResignationRequestDto,
  ): Promise<ResignationRequestStatusDto> {
    if (!dto.contractId) {
      // TODO[SCHEMA]: TerminationRequest schema requires contractId; resignation flow would ideally link to employment contract.
      throw new BadRequestException(
        'Contract reference is required to submit a resignation request.',
      );
    }

    const metadata = this.buildResignationMetadata(dto);

    const created = await this.terminationRequestModel.create({
      employeeId: new Types.ObjectId(dto.employeeId),
      initiator: TerminationInitiation.EMPLOYEE,
      reason: dto.reasonDescription,
      hrComments: metadata,
      status: TerminationStatus.PENDING,
      terminationDate: dto.proposedLastWorkingDay,
      contractId: new Types.ObjectId(dto.contractId),
    });

    return this.mapToResignationStatusDto(created);
  }

  async getResignationRequestById(
    id: string,
  ): Promise<ResignationRequestStatusDto> {
    const request = await this.terminationRequestModel.findById(id);
    if (!request) {
      throw new NotFoundException('Resignation request not found');
    }
    return this.mapToResignationStatusDto(request);
  }

  async getEmployeeResignationRequests(
    employeeId: string,
  ): Promise<ResignationRequestListItemDto[]> {
    const requests = await this.terminationRequestModel
      .find({
        employeeId: new Types.ObjectId(employeeId),
        initiator: TerminationInitiation.EMPLOYEE,
      })
      .sort({ createdAt: -1 });

    return requests.map((req) => this.mapToResignationListItemDto(req));
  }

  private async advanceResignationApprovalStep(
    requestId: string,
    approverRole: string,
    approved: boolean,
  ): Promise<void> {
    // TODO[INTEGRATION]: Offboarding Approval Workflow for resignations
    // - Update request status based on approverRole (LINE_MANAGER, FINANCE, HR).
    // - When fully approved: trigger termination/offboarding, clearance checklist, access revocation, and exit settlement.
    // - When rejected: mark as REJECTED and notify employee.
    // Requirement: BR-6, OFF-018, OFF-019.
    void requestId;
    void approverRole;
    void approved;
  }

  async initiateTerminationReview(
    dto: InitiateTerminationReviewDto,
  ): Promise<TerminationReviewDetailDto> {
    await this.validatePerformanceContext(dto.performanceRecordId);

    const metadata = this.buildMetadata(dto);

    const created = await this.terminationRequestModel.create({
      employeeId: new Types.ObjectId(dto.employeeId),
      initiator: dto.initiator ?? TerminationInitiation.HR,
      reason: dto.reasonDescription,
      // TODO[SCHEMA]: OFF-001 would benefit from explicit reasonCode/performance linkage fields.
      hrComments: metadata,
      status: TerminationStatus.PENDING,
      terminationDate: dto.effectiveDate,
      contractId: new Types.ObjectId(dto.contractId),
    });

    return this.mapToDetailDto(created, this.parseMetadata(metadata));
  }

  async getTerminationReviewById(id: string): Promise<TerminationReviewDetailDto> {
    const review = await this.terminationRequestModel.findById(id);
    if (!review) {
      throw new NotFoundException('Termination review not found');
    }
    return this.mapToDetailDto(review);
  }

  async listPendingTerminationReviews(
    status?: string,
  ): Promise<TerminationReviewSummaryDto[]> {
    const filter: FilterQuery<TerminationRequest> = {};
    const statusValue = Object.values(TerminationStatus).includes(
      status as TerminationStatus,
    )
      ? (status as TerminationStatus)
      : TerminationStatus.PENDING;
    filter.status = statusValue;

    const reviews = await this.terminationRequestModel
      .find(filter)
      .sort({ createdAt: -1 });

    return reviews.map((review) => this.mapToSummaryDto(review));
  }

  // OFF-006 – store a reusable clearance checklist template in-memory due to missing schema support.
  createClearanceChecklistTemplate(
    dto: ClearanceChecklistTemplateDto,
  ): ClearanceChecklistTemplateDto {
    // TODO[SCHEMA]: OFF-006 suggests a dedicated clearance template schema. Persisting in-memory for now.
    const template: ClearanceChecklistTemplateDto = {
      ...dto,
      id: dto.id ?? new Types.ObjectId().toString(),
    };
    const existingIndex = this.clearanceTemplates.findIndex(
      (item) => item.id === template.id,
    );
    if (existingIndex >= 0) {
      this.clearanceTemplates[existingIndex] = template;
    } else {
      this.clearanceTemplates.push(template);
    }
    return template;
  }

  private getDefaultTemplate(): ClearanceChecklistTemplateDto {
    return this.clearanceTemplates[0];
  }

  private mapChecklistToDto(
    checklist: ClearanceChecklistDocument,
    employeeId?: string,
  ): ClearanceInstanceDto {
    const items: ClearanceItemDto[] = (checklist.items || []).map((item: any) => {
      const comments = this.parseItemComments(item.comments);
      return {
        id: item._id?.toString?.() ?? '',
        department: item.department,
        label:
          comments.label ??
          `${item.department} clearance` /* fallback label if schema strips extras */,
        status: item.status,
        remarks: comments.remarks,
      };
    });

    const overallStatus = this.calculateOverallStatus(items.map((i) => i.status));

    return {
      id: checklist._id?.toString?.() ?? '',
      employeeId: employeeId ?? '',
      terminationRequestId: checklist.terminationId?.toString?.(),
      overallStatus,
      items,
    };
  }

  private calculateOverallStatus(itemStatuses: string[]): string {
    if (itemStatuses.length === 0) {
      // TODO[SCHEMA]: OFF-010 would benefit from explicit overall status persistence.
      return 'IN_PROGRESS';
    }
    const hasRejection = itemStatuses.some(
      (status) => status === ApprovalStatus.REJECTED,
    );
    if (hasRejection) {
      return 'BLOCKED';
    }
    const allApproved = itemStatuses.every(
      (status) => status === ApprovalStatus.APPROVED,
    );
    return allApproved ? 'CLEARED' : 'IN_PROGRESS';
  }

  async instantiateClearanceForTermination(
    terminationRequestId: string,
    employeeId: string,
  ): Promise<ClearanceInstanceDto> {
    const termination = await this.terminationRequestModel.findById(
      terminationRequestId,
    );
    if (!termination) {
      throw new NotFoundException('Termination request not found');
    }

    const template = this.getDefaultTemplate();
    const items = template.items.map((item) => ({
      department: item.department,
      status: ApprovalStatus.PENDING,
      comments: this.buildItemComments(item.label),
      updatedAt: new Date(),
    }));

    const checklist = await this.clearanceChecklistModel.create({
      terminationId: new Types.ObjectId(terminationRequestId),
      items,
      // TODO[SCHEMA]: OFF-006 expects associating equipment/card details per item; using existing fields only.
    });

    const resolvedEmployeeId =
      employeeId || termination.employeeId?.toString?.() || '';
    return this.mapChecklistToDto(checklist, resolvedEmployeeId);
  }

  async updateClearanceItemStatus(
    instanceId: string,
    itemId: string,
    status: string,
    remarks?: string,
  ): Promise<ClearanceInstanceDto> {
    const checklist = await this.clearanceChecklistModel.findById(instanceId);
    if (!checklist) {
      throw new NotFoundException('Clearance instance not found');
    }

    const item = (checklist.items || []).find(
      (it: any) => it._id?.toString?.() === itemId,
    );
    if (!item) {
      throw new NotFoundException('Clearance item not found');
    }

    item.status = status;
    const existingComments = this.parseItemComments(item.comments);
    item.comments = this.buildItemComments(existingComments.label ?? '', remarks);
    item.updatedAt = new Date();

    await checklist.save();

    const terminationIdString = checklist.terminationId?.toString?.();
    const termination = terminationIdString
      ? await this.terminationRequestModel.findById(terminationIdString)
      : null;

    const dto = this.mapChecklistToDto(checklist, termination?.employeeId?.toString?.());

    if (dto.overallStatus === 'CLEARED' && termination?.terminationDate) {
      // TODO[INTEGRATION]: Notify Payroll for final settlement once clearance is cleared (OFF-010, BR-13b/c, BR-14).
      if (termination.employeeId) {
        await this.sendExitSettlementNotification(
          termination.employeeId.toString(),
        );
      } else {
        // TODO[SCHEMA]: OFF-013 expects employeeId to build settlement payload; existing termination record missing employeeId.
      }
      await this.revokeSystemAccess(
        termination.employeeId?.toString?.() ?? '',
        termination.terminationDate,
      );
    }

    return dto;
  }

  async getClearanceInstanceByEmployee(
    employeeId: string,
  ): Promise<ClearanceInstanceDto | null> {
    const termination = await this.terminationRequestModel
      .findOne({ employeeId: new Types.ObjectId(employeeId) })
      .sort({ createdAt: -1 });
    if (!termination) {
      return null;
    }

    const checklist = await this.clearanceChecklistModel.findOne({
      terminationId: termination._id,
    });
    if (!checklist) {
      return null;
    }
    return this.mapChecklistToDto(checklist, employeeId);
  }

  async getClearanceInstanceById(id: string): Promise<ClearanceInstanceDto> {
    const checklist = await this.clearanceChecklistModel.findById(id);
    if (!checklist) {
      throw new NotFoundException('Clearance instance not found');
    }
    const terminationIdString = checklist.terminationId?.toString?.();
    const termination = terminationIdString
      ? await this.terminationRequestModel.findById(terminationIdString)
      : null;
    return this.mapChecklistToDto(checklist, termination?.employeeId?.toString?.());
  }

  async buildExitSettlementPreview(
    employeeId: string,
  ): Promise<ExitSettlementPreviewDto> {
    const termination = await this.terminationRequestModel
      .findOne({ employeeId: new Types.ObjectId(employeeId) })
      .sort({ createdAt: -1 });

    const terminationDate = termination?.terminationDate ?? new Date();

    // TODO[INTEGRATION]: Fetch remaining leave balance for employee from Leaves module.
    // Requirement: OFF-013, BR-9 (unused annual leave encashment).
    // TODO[INTEGRATION]: Fetch active benefits plans from Employee Profile module to determine termination dates.
    const preview: ExitSettlementPreviewDto = {
      employeeId,
      terminationEffectiveDate: terminationDate,
      noticeEndDate: undefined,
      remainingLeaveDays: undefined,
      estimatedLeaveEncashmentAmount: undefined,
      benefitsToTerminate: undefined,
    };

    if (!termination?.terminationDate) {
      // TODO[SCHEMA]: OFF-013 would benefit from explicit terminationEffectiveDate on termination records.
    }

    return preview;
  }

  async sendExitSettlementNotification(
    employeeId: string,
  ): Promise<ExitSettlementNotificationDto> {
    const preview = await this.buildExitSettlementPreview(employeeId);

    const payload: ExitSettlementNotificationDto = {
      employeeId,
      terminationEffectiveDate: preview.terminationEffectiveDate,
      noticeEndDate: preview.noticeEndDate,
      remainingLeaveDays: preview.remainingLeaveDays,
      benefitsPlanIds: undefined,
      remarks:
        'OFF-013 – trigger Payroll for final settlement, leave encashment, and benefits termination.',
    };

    // TODO[INTEGRATION]: Send ExitSettlementNotificationDto to Payroll Module (PY) for final pay calculation and benefits termination.
    // Requirements: OFF-013, BR-9, BR-11.
    // TODO[SCHEMA]: OFF-013 would benefit from settlement notification audit log.

    return payload;
  }

  async revokeSystemAccess(
    employeeId: string,
    effectiveDate: Date,
    reasons?: string,
  ): Promise<void> {
    const payload: AccessRevocationDto = {
      employeeId,
      terminationEffectiveDate: effectiveDate,
      reasons,
    };
    // TODO[INTEGRATION]: Send AccessRevocationDto to IT/Access systems to revoke SSO, email, and system accounts.
    // Requirement: OFF-007, BR-3(c), BR-19.
 
  }
}