import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateOnboardingChecklistDto } from './dto/create-onboarding-checklist.dto';
import { StartOnboardingDto } from './dto/start-onboarding.dto';
import { UploadOnboardingDocumentDto } from './dto/upload-onboarding-document.dto';
import { OnboardingTaskDto } from './dto/onboarding-task.dto';
import { OnboardingTrackerDto } from './dto/onboarding-tracker.dto';
import { OnboardingDocumentDto } from './dto/onboarding-document.dto';
import { ProvisioningTaskDto } from './dto/provisioning-task.dto';
import { Onboarding, OnboardingDocument } from '../recruitment/models/onboarding.schema';
import { Document, DocumentDocument } from '../recruitment/models/document.schema';
import { OnboardingTaskStatus } from '../recruitment/enums/onboarding-task-status.enum';
import { DocumentType } from '../recruitment/enums/document-type.enum';
import { PayrollInitiationDto } from './dto/payroll-initiation.dto';
import { SigningBonusTriggerDto } from './dto/signing-bonus-trigger.dto';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectModel(Onboarding.name)
    private readonly onboardingModel: Model<OnboardingDocument>,
    @InjectModel(Document.name)
    private readonly documentModel: Model<DocumentDocument>,
  ) {}

  async createOnboardingChecklist(
    dto: CreateOnboardingChecklistDto,
  ): Promise<CreateOnboardingChecklistDto> {
    // TODO[SCHEMA]: ONB-001 requires persisting checklist templates; returning DTO until schema is available.
    return dto;
  }

  async startOnboardingForAcceptedOffer(
    payload: StartOnboardingDto,
  ): Promise<OnboardingDocument> {
    if (!payload.candidateId) {
      throw new BadRequestException('candidateId is required to start onboarding');
    }

    const defaultTasks = [
      {
        name: 'Upload signed contract',
        department: 'HR',
        status: OnboardingTaskStatus.PENDING,
        deadline: payload.startDate,
        notes: 'Contract review and storage',
      },
      {
        name: 'Complete onboarding forms',
        department: 'HR',
        status: OnboardingTaskStatus.PENDING,
        notes: 'Personal details, tax forms, banking where applicable',
      },
    ];

    // TODO[SCHEMA]: Start date, department, and job template linkage are not stored on Onboarding schema.
    const onboarding = await this.onboardingModel.create({
      employeeId: new Types.ObjectId(payload.candidateId),
      tasks: defaultTasks,
      completed: false,
    });

    for (const task of onboarding.tasks || []) {
      await this.notifyOnboardingTaskAssigned(task, payload.candidateId);
    }

    await this.createProvisioningTasks(onboarding._id.toString());
    await this.triggerPayrollInitiation(onboarding._id.toString());
    await this.triggerSigningBonusProcessing(onboarding._id.toString());

    const persisted = await this.onboardingModel.findById(onboarding._id);
    if (!persisted) {
      throw new NotFoundException('Onboarding instance not found after creation');
    }

    return persisted;

  }

  async uploadOnboardingDocument(
    dto: UploadOnboardingDocumentDto,
  ): Promise<OnboardingDocumentDto> {
    const documentTypeValues = Object.values(DocumentType);
    const providedType = documentTypeValues.includes(dto.documentType as DocumentType)
      ? (dto.documentType as DocumentType)
      : DocumentType.CONTRACT;

    const createdDoc = await this.documentModel.create({
      ownerId: new Types.ObjectId(dto.candidateId),
      type: providedType,
      filePath: dto.fileUrl,
      uploadedAt: new Date(),
    });

    if (dto.onboardingId) {
      const onboarding = await this.onboardingModel.findById(dto.onboardingId);
      if (!onboarding) {
        throw new NotFoundException('Onboarding instance not found for document upload');
      }

      const targetTask = onboarding.tasks?.find((task: any) => !task.documentId);
      if (targetTask) {
        targetTask.documentId = createdDoc._id;
        if (dto.notes) {
          targetTask.notes = dto.notes;
        }
      } else {
        onboarding.tasks = onboarding.tasks || [];
        onboarding.tasks.push({
          name: `${providedType} document upload`,
          department: 'HR',
          status: OnboardingTaskStatus.PENDING,
          documentId: createdDoc._id,
          notes: dto.notes,
        });
      }

      onboarding.markModified('tasks');
      await onboarding.save();
    }

    // Requirement: ONB-007, BR-7 – registering new hire documents for compliance (ID, contracts, certifications).
    // TODO[SCHEMA]: ONB-007 needs explicit verification metadata (verifiedBy/verifiedAt) on documents or tasks.
    // Requirement: ONB-002, ONB-004.

    return this.mapDocumentToDto(createdDoc);
  }

  async getOnboardingDocuments(
    onboardingId: string,
  ): Promise<OnboardingDocumentDto[]> {
    const onboarding = await this.onboardingModel.findById(onboardingId);
    if (!onboarding) {
      throw new NotFoundException('Onboarding instance not found');
    }

    const docIds = (onboarding.tasks || [])
      .map((task: any) => task.documentId)
      .filter((id: any) => !!id);

    if (docIds.length === 0) {
      return [];
    }

    const documents = await this.documentModel
      .find({ _id: { $in: docIds } })
      .lean();

    return documents.map((doc) => this.mapDocumentToDto(doc));
  }

  async getCandidateDocuments(candidateId: string): Promise<OnboardingDocumentDto[]> {
    const documents = await this.documentModel
      .find({ ownerId: new Types.ObjectId(candidateId) })
      .lean();

    return documents.map((doc) => this.mapDocumentToDto(doc));
  }

  async verifyOnboardingDocument(
    documentId: string,
    hrUserId: string,
  ): Promise<OnboardingDocumentDto> {
    const document = await this.documentModel.findById(documentId);
    if (!document) {
      throw new NotFoundException('Document not found for verification');
    }

    const onboardingList = await this.onboardingModel.find({
      'tasks.documentId': document._id,
    });

    for (const onboarding of onboardingList) {
      onboarding.tasks = (onboarding.tasks || []).map((task: any) => {
        if (task.documentId?.toString?.() === documentId) {
          task.status = OnboardingTaskStatus.COMPLETED;
          task.completedAt = new Date();
        }
        return task;
      });

      onboarding.markModified('tasks');
      await onboarding.save();

      await this.maybeTriggerEmployeeProfileCreation(
        document.ownerId?.toString?.(),
        onboarding._id?.toString?.(),
      );
    }

    // TODO[SCHEMA]: BR-7 requires tracking who verified and when; current Document/Onboarding schemas lack verification fields.
    // TODO[COMPLIANCE]: Capture verification audit trail for GDPR/labor-law compliance.
    void hrUserId;

    return this.mapDocumentToDto(document);
  }

  async getOnboardingTrackerForCandidate(
    candidateId: string,
  ): Promise<OnboardingTrackerDto> {
    const onboarding = await this.onboardingModel
      .findOne({ employeeId: new Types.ObjectId(candidateId) })
      .lean<Onboarding & { _id: Types.ObjectId }>();

    if (!onboarding) {
      throw new NotFoundException('Onboarding instance not found for candidate');
    }

    return this.mapToTrackerDto(onboarding, candidateId);
  }

  async getOnboardingTrackerById(
    onboardingId: string,
  ): Promise<OnboardingTrackerDto> {
    const onboarding = await this.onboardingModel
      .findById(onboardingId)
      .lean<Onboarding & { _id: Types.ObjectId }>();
    if (!onboarding) {
      throw new NotFoundException('Onboarding instance not found');
    }

    return this.mapToTrackerDto(onboarding, onboarding.employeeId?.toString?.());
  }

  async completeOnboardingTask(
    onboardingId: string,
    taskId: string,
    actorId: string,
  ): Promise<any> {
    const onboarding = await this.onboardingModel.findById(onboardingId);
    if (!onboarding) {
      throw new NotFoundException('Onboarding instance not found');
    }

    const taskIndex = onboarding.tasks.findIndex((task: any) => {
      const idMatch = task._id?.toString?.() === taskId;
      const fallbackMatch = `${onboarding._id}-${onboarding.tasks.indexOf(task)}` === taskId;
      return idMatch || fallbackMatch;
    });

    if (taskIndex === -1) {
      throw new NotFoundException('Onboarding task not found');
    }

    onboarding.tasks[taskIndex].status = OnboardingTaskStatus.COMPLETED;
    onboarding.tasks[taskIndex].completedAt = new Date();
    onboarding.markModified('tasks');
    const saved = await onboarding.save();

    // TODO[INTEGRATION]: Notify responsible party and candidate of task completion.
    // Requirement: ONB-004, ONB-005.
    void actorId;

    return saved.tasks[taskIndex];
  }

  async createProvisioningTasks(
    onboardingId: string,
  ): Promise<ProvisioningTaskDto[]> {
    const onboarding = await this.onboardingModel.findById(onboardingId);
    if (!onboarding) {
      throw new NotFoundException('Onboarding instance not found for provisioning');
    }

    onboarding.tasks = onboarding.tasks || [];

    const provisioningTasks = [
      {
        name: 'Create corporate email',
        department: 'IT',
        status: OnboardingTaskStatus.PENDING,
        notes: 'Auto-provision email/SSO accounts. Category: IT.',
      },
      {
        name: 'Provision SSO accounts',
        department: 'IT',
        status: OnboardingTaskStatus.PENDING,
        notes: 'Provision identity and access. Category: IT.',
      },
      {
        name: 'Assign laptop/equipment',
        department: 'IT',
        status: OnboardingTaskStatus.PENDING,
        notes: 'Hardware allocation. Category: IT.',
      },
      {
        name: 'Assign desk/workspace',
        department: 'Facilities',
        status: OnboardingTaskStatus.PENDING,
        notes: 'Workspace preparation. Category: FACILITIES.',
      },
      {
        name: 'Prepare access card/badge',
        department: 'Facilities',
        status: OnboardingTaskStatus.PENDING,
        notes: 'Access badge creation. Category: ACCESS.',
      },
    ];

    // TODO[SCHEMA]: ONB-009/ONB-012 task categories and provisioning metadata are not first-class fields on tasks.

    onboarding.tasks.push(...provisioningTasks);
    onboarding.markModified('tasks');
    const saved = await onboarding.save();

    const appendedTasks = saved.tasks.slice(-provisioningTasks.length);
    for (const task of appendedTasks) {
      await this.notifyOnboardingTaskAssigned(task, onboarding.employeeId?.toString?.());
    }

    // TODO[INTEGRATION]: Notify IT/Facilities via Notification module about new provisioning tasks.

    return appendedTasks.map((task, index) =>
      this.mapProvisioningTaskToDto(task, provisioningTasks[index]?.department),
    );
  }

  async provisionAccounts(onboardingId: string): Promise<void> {
    const onboarding = await this.onboardingModel.findById(onboardingId);
    if (!onboarding) {
      throw new NotFoundException('Onboarding instance not found for provisioning accounts');
    }

    onboarding.tasks = (onboarding.tasks || []).map((task: any) => {
      if (task.department?.toLowerCase?.() === 'it') {
        task.status = OnboardingTaskStatus.IN_PROGRESS;
        task.notes = `${task.notes ?? ''} Trigger IT account provisioning.`.trim();
      }
      return task;
    });

    onboarding.markModified('tasks');
    await onboarding.save();

    // TODO[INTEGRATION]: Connect with IT systems for email/SSO/laptop provisioning (ONB-009, ONB-013).
    // TODO[INTEGRATION]: Notify IT/Admin via Notifications module.
  }

  async reserveResources(onboardingId: string): Promise<void> {
    const onboarding = await this.onboardingModel.findById(onboardingId);
    if (!onboarding) {
      throw new NotFoundException('Onboarding instance not found for facilities provisioning');
    }

    onboarding.tasks = (onboarding.tasks || []).map((task: any) => {
      if (task.department?.toLowerCase?.() === 'facilities') {
        task.status = OnboardingTaskStatus.IN_PROGRESS;
        task.notes = `${task.notes ?? ''} Trigger facilities allocation.`.trim();
      }
      return task;
    });

    onboarding.markModified('tasks');
    await onboarding.save();

    // TODO[INTEGRATION]: Connect with Facilities/Admin systems for desk/badge allocation (ONB-012).
    // TODO[INTEGRATION]: Notify Facilities via Notifications module.
  }

  async cancelOnboarding(
    onboardingId: string,
    reason?: string,
  ): Promise<Onboarding & { _id: Types.ObjectId | string }> {
    const onboarding = await this.onboardingModel.findById(onboardingId);
    if (!onboarding) {
      throw new NotFoundException('Onboarding instance not found for cancellation');
    }

    onboarding.completed = true;
    onboarding.completedAt = new Date();
    onboarding.tasks = (onboarding.tasks || []).map((task: any) => {
      if (task.status !== OnboardingTaskStatus.COMPLETED) {
        task.status = OnboardingTaskStatus.COMPLETED;
        task.notes = `${task.notes ?? ''} Cancelled onboarding task.`.trim();
      }
      return task;
    });

    // TODO[SCHEMA]: ONB-013 needs explicit cancellation/no-show status and reason storage on onboarding; current schema lacks these fields.
    void reason;

    onboarding.markModified('tasks');
    const saved = await onboarding.save();

    await this.scheduleAccessRevocation(onboardingId);

    // TODO[INTEGRATION]: Inform IT/Facilities to revoke provisioning and cancel allocations. Requirement: ONB-013, BR-20.

    return saved.toObject() as Onboarding & { _id: Types.ObjectId | string };
  }

  async scheduleAccessRevocation(onboardingId: string): Promise<void> {
    const onboarding = await this.onboardingModel.findById(onboardingId);
    if (!onboarding) {
      throw new NotFoundException('Onboarding instance not found for access revocation scheduling');
    }

    onboarding.tasks = onboarding.tasks || [];
    onboarding.tasks.push({
      name: 'Schedule access revocation at exit',
      department: 'IT',
      status: OnboardingTaskStatus.PENDING,
      notes:
        'Plan account disablement and badge deactivation. Category: ACCESS/IT.',
    });
    onboarding.markModified('tasks');
    await onboarding.save();

    // TODO[INTEGRATION]: Connect with Offboarding/IT systems to schedule actual access revocation (ONB-013, BR-20).
  }

  async triggerPayrollInitiation(onboardingId: string): Promise<void> {
    const onboarding = await this.onboardingModel.findById(onboardingId);
    if (!onboarding) {
      throw new NotFoundException('Onboarding instance not found for payroll initiation');
    }

    const payrollPayload: PayrollInitiationDto = {
      onboardingId: onboarding._id.toString(),
      candidateId: onboarding.employeeId?.toString?.() ?? '',
      contractSigningDate:
        (onboarding as any).contractSigningDate ||
        (onboarding as any).createdAt ||
        new Date(),
      // TODO[SCHEMA]: Contract signing date and payroll cycle are not modeled; using createdAt as fallback for ONB-018 / REQ-PY-23.
      effectiveStartDate: undefined,
      payrollCycle: undefined,
    };

    onboarding.tasks = onboarding.tasks || [];
    const hasPayrollTask = onboarding.tasks.some(
      (task: any) => task.name?.toLowerCase?.().includes('payroll'),
    );
    if (!hasPayrollTask) {
      onboarding.tasks.push({
        name: 'Review payroll & benefits setup',
        department: 'HR',
        status: OnboardingTaskStatus.PENDING,
        notes: 'Auto-generated task for payroll initiation per ONB-018 / BR-9(a).',
      });
      onboarding.markModified('tasks');
      await onboarding.save();
      await this.notifyOnboardingTaskAssigned(
        onboarding.tasks[onboarding.tasks.length - 1],
        onboarding.employeeId?.toString?.() ?? '',
      );
    }

    // TODO[INTEGRATION]: Send PayrollInitiationDto to Payroll Module (PY) to initiate new hire payroll.
    // Requirement: ONB-018, BR-9(a), REQ-PY-23.
    void payrollPayload;
  }

  async triggerSigningBonusProcessing(onboardingId: string): Promise<void> {
    const onboarding = await this.onboardingModel.findById(onboardingId);
    if (!onboarding) {
      throw new NotFoundException('Onboarding instance not found for signing bonus processing');
    }

    const signingBonusPayload: SigningBonusTriggerDto = {
      onboardingId: onboarding._id.toString(),
      candidateId: onboarding.employeeId?.toString?.() ?? '',
      contractId: undefined,
      signingBonusAmount: undefined,
      currency: undefined,
      // TODO[SCHEMA]: Contract ID and signing bonus details are not modeled; provide skeleton payload for ONB-019 / REQ-PY-27.
    };

    onboarding.tasks = onboarding.tasks || [];
    const hasSigningBonusTask = onboarding.tasks.some((task: any) =>
      task.name?.toLowerCase?.().includes('signing bonus'),
    );
    if (!hasSigningBonusTask) {
      onboarding.tasks.push({
        name: 'Process signing bonus (if applicable)',
        department: 'HR',
        status: OnboardingTaskStatus.PENDING,
        notes: 'Auto-generated task for signing bonus coordination per ONB-019 / BR-9(a).',
      });
      onboarding.markModified('tasks');
      await onboarding.save();
      await this.notifyOnboardingTaskAssigned(
        onboarding.tasks[onboarding.tasks.length - 1],
        onboarding.employeeId?.toString?.() ?? '',
      );
    }

    // TODO[INTEGRATION]: Send SigningBonusTriggerDto to Payroll Module (PY) for signing bonus processing.
    // Requirement: ONB-019, BR-9(a), REQ-PY-27.
    void signingBonusPayload;
  }

  private mapToTrackerDto(
    onboarding: Onboarding & { _id: Types.ObjectId | string },
    candidateId?: string,
  ): OnboardingTrackerDto {
    const tasks: OnboardingTaskDto[] = (onboarding.tasks || []).map(
      (task: any, index: number) => ({
        id: task._id?.toString?.() ?? `${onboarding._id}-${index}`,
        title: task.name,
        description: task.notes,
        status: task.status,
        dueDate: task.deadline,
        completedAt: task.completedAt,
        responsiblePartyId: task.department,
      }),
    );

    return {
      onboardingId: onboarding._id.toString(),
      candidateId: candidateId ?? onboarding.employeeId?.toString?.(),
      tasks,
    };
  }

  private mapDocumentToDto(
    doc: Document & { _id?: Types.ObjectId | string },
  ): OnboardingDocumentDto {
    return {
      id: doc._id?.toString?.() ?? '',
      documentType: doc.type,
      fileUrl: doc.filePath,
      uploadedAt: doc.uploadedAt ?? (doc as any).createdAt,
      // TODO[SCHEMA]: BR-7 would benefit from explicit verified flag and verifier metadata.
      verified: undefined,
    };
  }

  private mapProvisioningTaskToDto(
    task: any,
    department?: string,
  ): ProvisioningTaskDto {
    const category = (department || task?.department || '').toString().toUpperCase();

    return {
      taskId: task._id?.toString?.() ?? '',
      category:
        category === 'IT'
          ? 'IT'
          : category === 'FACILITIES'
          ? 'FACILITIES'
          : 'ACCESS',
      title: task.name,
      description: task.notes,
      dueDate: task.deadline,
      status: task.status,
      responsiblePartyId: task.department,
      notes: task.notes,
    };
  }

  private async maybeTriggerEmployeeProfileCreation(
    candidateId?: string,
    onboardingId?: string,
  ): Promise<void> {
    // TODO[INTEGRATION]: Once required onboarding documents are verified, integrate with Employee Profile module
    // to create/complete the employee profile and attach verified documents.
    // Requirement: ONB-002, ONB-007, BR-7, BR-17.
    void candidateId;
    void onboardingId;
  }

  private async notifyOnboardingTaskAssigned(
    task: any,
    responsiblePartyId: string,
  ): Promise<void> {
    // TODO[INTEGRATION]: Call Notifications module (N) to send a task assignment notification.
    // Requirement: ONB-005, BR-12.
    // Include task title, due date, onboardingId, and candidateId.
    void task;
    void responsiblePartyId;
  }

  private async notifyOnboardingTaskReminder(task: any): Promise<void> {
    // TODO[INTEGRATION]: Call Notifications module (N) to send reminder for pending onboarding task.
    // Could be scheduled by a separate scheduler/cron job, out of scope here.
    void task;
  }
}