import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  LeaveRequest,
  LeaveRequestDocument,
} from './models/leave-request.schema';
import { LeaveType, LeaveTypeDocument } from './models/leave-type.schema';
import { LeavePolicy, LeavePolicyDocument } from './models/leave-policy.schema';
import { AccrualMethod } from './enums/accrual-method.enum';
import {
  LeaveEntitlement,
  LeaveEntitlementDocument,
} from './models/leave-entitlement.schema';
import {
  LeaveAdjustment,
  LeaveAdjustmentDocument,
} from './models/leave-adjustment.schema';
import { Calendar, CalendarDocument } from './models/calendar.schema';
import { Holiday, HolidayDocument } from './models/holiday.schema';
import {
  VacationPackage,
  VacationPackageDocument,
} from './models/vacation-package.schema';
import {
  ApprovalWorkflow,
  ApprovalWorkflowDocument,
} from './models/approval-workflow.schema';
import {
  LeaveEncashment,
  LeaveEncashmentDocument,
} from './models/leave-encashment.schema';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto';
import { ReviewRequestDto } from './dto/review-request.dto';
import { ReviewAction } from './enums/review-action.enum';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { LeaveStatus } from './enums/leave-status.enum';

/**
 * LeavesService implements leave management business logic. This is a simplified
 * yet complete implementation for the milestone with integration TODOs where external
 * systems are required (Payroll, EmployeeProfile, Org Structure, Time Management).
 */
@Injectable()
export class LeavesService {
  private readonly logger = new Logger(LeavesService.name);

  constructor(
    @InjectModel(LeaveRequest.name)
    private leaveRequestModel: Model<LeaveRequestDocument>,
    @InjectModel(LeaveType.name)
    private leaveTypeModel: Model<LeaveTypeDocument>,
    @InjectModel(LeavePolicy.name)
    private leavePolicyModel: Model<LeavePolicyDocument>,
    @InjectModel(LeaveEntitlement.name)
    private entitlementModel: Model<LeaveEntitlementDocument>,
    @InjectModel(LeaveAdjustment.name)
    private adjustmentModel: Model<LeaveAdjustmentDocument>,
    @InjectModel(Calendar.name) private calendarModel: Model<CalendarDocument>,
    @InjectModel(Holiday.name) private holidayModel: Model<HolidayDocument>,
    @InjectModel(VacationPackage.name)
    private vacationPackageModel: Model<VacationPackageDocument>,
    @InjectModel(ApprovalWorkflow.name)
    private workflowModel: Model<ApprovalWorkflowDocument>,
    @InjectModel(LeaveEncashment.name)
    private encashmentModel: Model<LeaveEncashmentDocument>,
  ) {}

  async createLeaveType(payload: any) {
    const existing = await this.leaveTypeModel.findOne({ code: payload.code });
    if (existing) throw new ConflictException('Leave type already exists');
    const created = new this.leaveTypeModel(payload);
    return created.save();
  }

  async createHoliday(dto: {
    name: string;
    date: string;
    recurring?: boolean;
  }) {
    const d = new Date(dto.date);
    const existing = await this.holidayModel.findOne({
      name: dto.name,
      date: d,
    });
    if (existing) return existing;
    const created = new this.holidayModel({
      name: dto.name,
      date: d,
      recurring: dto.recurring ?? false,
    });
    return created.save();
  }

  async assignVacationPackage(dto: {
    packageId: string;
    employeeId: string;
    assignedBy?: string;
  }) {
    // TODO: Validate package and employee; integrate with EmployeeProfile
    const pkg = await this.vacationPackageModel.findById(dto.packageId);
    if (!pkg) throw new NotFoundException('Package not found');
    pkg.assignedToEmployeeId = new Types.ObjectId(dto.employeeId);
    await pkg.save();
    // TODO: Apply package to entitlement for the employee
    return pkg;
  }

  async createApprovalWorkflow(dto: { name: string; steps: any[] }) {
    const wf = new this.workflowModel(dto);
    return wf.save();
  }

  async encashLeave(dto: {
    employeeId: string;
    leaveTypeId: string;
    days: number;
    payPeriod: string;
  }) {
    // Validate entitlement & compute encashment based on daily salary (Fetch from employee profile/payroll)
    // TODO: Integrate with Employee Profile to fetch daily salary
    const entitlement = await this.entitlementModel.findOne({
      employeeId: dto.employeeId,
      leaveTypeId: dto.leaveTypeId,
    });
    if (!entitlement) throw new NotFoundException('Entitlement not found');
    // Cap at 30 days
    const days = Math.min(dto.days, 30);
    if ((entitlement.remaining ?? 0) < days)
      throw new BadRequestException('Insufficient balance for encashment');
    // TODO: replace dailySalary with a call to Payroll subsystem
    const dailySalary = 100; // placeholder
    const amount = days * dailySalary;
    const encashment = new this.encashmentModel({
      employeeId: dto.employeeId,
      leaveTypeId: dto.leaveTypeId,
      daysEncashed: days,
      amount,
      payPeriod: dto.payPeriod,
    });
    await encashment.save();
    // Deduct from entitlement
    entitlement.remaining -= days;
    entitlement.taken += days;
    await entitlement.save();
    // TODO: Integrate with Payroll subsytem to process amount payment and tax handling
    return encashment;
  }

  /* =========================
   * Admin: Policies & Types
   * ========================= */
  async createPolicy(dto: CreateLeavePolicyDto) {
    const existing = await this.leavePolicyModel
      .findOne({ leaveTypeId: dto.leaveTypeId })
      .exec();
    if (existing) {
      // Merge update semantics
      Object.assign(existing, dto);
      await existing.save();
      return existing;
    }
    const created = new this.leavePolicyModel(dto);
    return created.save();
  }

  /* =========================
   * Employee: Submit, balances
   * ========================= */
  async submitRequest(dto: CreateLeaveRequestDto) {
    // Validate dates
    const from = new Date(dto.from);
    const to = new Date(dto.to);
    if (from > to) throw new BadRequestException('Invalid date range');

    // Check holidays and blocked days
    const holidaysInRange = await this.holidayModel
      .find({ date: { $gte: from, $lte: to } })
      .lean();

    const blocked = await this._overlapsBlockedPeriod(from, to);
    if (blocked)
      throw new BadRequestException('Leave overlaps a blocked period.');

    const leaveType = await this.leaveTypeModel
      .findById(dto.leaveTypeId)
      .exec();
    if (!leaveType) throw new NotFoundException('Leave type not found');

    // Enforce minTenure
    // TODO: Integrate with EmployeeProfile subsystem to fetch tenure.
    // Example: employeeTenureMonths = await employeeProfileService.getTenureMonths(dto.employeeId)
    // if (leaveType.minTenureMonths && employeeTenureMonths < leaveType.minTenureMonths) throw new BadRequestException('Ineligible due to tenure');

    let durationDays = dto.durationDays ?? this._calcDays(from, to);
    // Subtract holiday days as they are not taken from leave balance
    const holidayCount = holidaysInRange.length || 0;
    durationDays = Math.max(0, durationDays - holidayCount);
    if (durationDays === 0)
      throw new BadRequestException('Requested range contains no working days');

    // Ensure entitlement exists
    let entitlement = await this.entitlementModel.findOne({
      employeeId: dto.employeeId,
      leaveTypeId: dto.leaveTypeId,
    });
    if (!entitlement) {
      entitlement = new this.entitlementModel({
        employeeId: dto.employeeId,
        leaveTypeId: dto.leaveTypeId,
      });
      await entitlement.save();
    }

    // Compute unpaidDays if balance insufficient
    const remaining = entitlement.remaining ?? 0;
    let unpaidDays = 0;
    let paidDays = durationDays;
    if (remaining < durationDays) {
      unpaidDays = durationDays - Math.max(0, remaining);
      paidDays = Math.max(0, remaining);
    }

    // Check max consecutive days
    const policy = await this.leavePolicyModel.findOne({
      leaveTypeId: dto.leaveTypeId,
    });

    // Max sick leave enforcement
    if (leaveType.code && leaveType.code.toLowerCase() === 'sick') {
      const maxSickYear = (policy && (policy as any).maxSickPerYear) ?? null;
      if (maxSickYear) {
        const taken = entitlement.taken ?? 0;
        if (taken + paidDays > maxSickYear)
          throw new BadRequestException('Sick leave exceeds annual limit');
      }
    }
    if (
      policy &&
      policy.maxConsecutiveDays &&
      durationDays > policy.maxConsecutiveDays
    ) {
      throw new BadRequestException(
        'Requested duration exceeds maximum consecutive days allowed',
      );
    }

    // Grace period for backdated requests
    const GRACE_DAYS = 14; // default
    const now = new Date();
    if (from < now) {
      const diffDays = Math.round(
        (now.getTime() - from.getTime()) / (24 * 60 * 60 * 1000),
      );
      if (diffDays > GRACE_DAYS) {
        // Allow HR to override backdated if required
        throw new BadRequestException(
          'Backdated requests are outside the grace period',
        );
      }
    }
    // Create request
    const request = new this.leaveRequestModel({
      employeeId: dto.employeeId,
      leaveTypeId: dto.leaveTypeId,
      dates: { from, to },
      durationDays,
      unpaidDays,
      justification: dto.justification,
      attachmentId: dto.attachmentId,
      approvalFlow: [],
    });

    // Build approval flow: default to Manager -> HR
    const defaultWorkflow = await this._getDefaultWorkflow();
    request.approvalFlow = defaultWorkflow.steps.map((s) => ({
      role: s.role,
      status: 'PENDING',
    }));
    // If the first step has timeout, set escalateAt
    if (
      defaultWorkflow.steps &&
      defaultWorkflow.steps.length &&
      defaultWorkflow.steps[0].timeoutHours
    ) {
      const created = new Date();
      request.escalateAt = new Date(
        created.getTime() +
          (defaultWorkflow.steps[0].timeoutHours ?? 0) * 3600 * 1000,
      );
    }

    // Save
    const saved = await request.save();

    // Update entitlement pending
    await this._addPending(dto.employeeId, dto.leaveTypeId, durationDays);

    // Mark escalateAt field if manager doesn't respond (added as part of request doc)
    // TODO: Configure a scheduled job to auto-escalate based on the workflow timeout.

    this.logger.log(`Leave request ${saved._id} created for ${dto.employeeId}`);
    return saved;
  }

  async getEmployeeBalance(employeeId: string) {
    const entitlements = await this.entitlementModel
      .find({ employeeId })
      .lean();
    // For each entitlement, ensure accruals are applied; this is an ad-hoc calculation.
    const now = new Date();
    const results: any[] = [];
    for (const e of entitlements) {
      const policy = await this.leavePolicyModel.findOne({
        leaveTypeId: e.leaveTypeId,
      });
      // Run on-demand accrual if policy configured
      if (policy) {
        await this._applyAccrualIfDue(e, policy, now);
      }
      // Recompute remaining
      const remaining =
        (e.yearlyEntitlement ?? 0) +
        (e.accruedRounded ?? 0) +
        (e.carryForward ?? 0) -
        (e.taken ?? 0) -
        (e.pending ?? 0);
      results.push({
        ...(e as any),
        leaveTypeId: String(e.leaveTypeId),
        remaining,
      });
    }
    return results;
  }

  /* =========================
   * Review / Approvals
   * ========================= */
  async processReview(requestId: string, review: ReviewRequestDto) {
    const request = await this.leaveRequestModel.findById(requestId);
    if (!request) throw new NotFoundException('Leave request not found');

    // Validate the role of approver - TODO: integrate with employee profile and org structure
    // For now we accept the action and update the next step
    const { approverId, action, comment } = review as any;

    // Find the first pending step
    const idx = request.approvalFlow.findIndex((r) => r.status === 'PENDING');
    if (idx === -1) throw new BadRequestException('No pending approvals');

    request.approvalFlow[idx].status = action; // APPROVE/REJECT/OVERRIDE
    request.approvalFlow[idx].decidedBy = new Types.ObjectId(approverId);
    request.approvalFlow[idx].decidedAt = new Date();

    // If rejected, set overall status to REJECTED
    if (action === ReviewAction.REJECT) {
      request.status = LeaveStatus.REJECTED;
      await request.save();
      await this._subtractPending(
        request.employeeId,
        request.leaveTypeId,
        request.durationDays,
      );
      return request;
    }

    // If action is OVERRIDE by HR, allow directly mark as APPROVED and update balances
    const requiresHR = request.approvalFlow.some((s) =>
      s.role.toLowerCase().includes('hr'),
    );
    const isFinalApproval =
      idx === request.approvalFlow.length - 1 ||
      (action === ReviewAction.APPROVE && !requiresHR);

    // If final approval, set status and deduct entitlement
    if (
      isFinalApproval ||
      action === ReviewAction.APPROVE ||
      action === ReviewAction.OVERRIDE
    ) {
      request.status = LeaveStatus.APPROVED;
      await request.save();
      // Update entitlement
      const paidDays = request.durationDays - (request.unpaidDays ?? 0);
      if (paidDays > 0)
        await this._applyTaken(
          request.employeeId,
          request.leaveTypeId,
          paidDays,
        );
      return request;
    }

    await request.save();
    return request;
  }

  async delegateApproval(
    requestId: string,
    delegateTo: string,
    delegatorId: string,
  ) {
    const request = await this.leaveRequestModel.findById(requestId);
    if (!request) throw new NotFoundException('Leave request not found');
    const idx = request.approvalFlow.findIndex((r) => r.status === 'PENDING');
    if (idx === -1)
      throw new BadRequestException('No pending approvals to delegate');
    request.escalatedTo = new Types.ObjectId(delegateTo);
    request.updatedBy = new Types.ObjectId(delegatorId);
    await request.save();
    return request;
  }

  async modifyRequest(requestId: string, body: any) {
    const request = await this.leaveRequestModel.findById(requestId);
    if (!request) throw new NotFoundException('Leave request not found');
    if (request.status !== LeaveStatus.PENDING)
      throw new BadRequestException('Only pending requests can be modified');
    // Update duration and pending entitlement
    const oldDays = request.durationDays;
    const from = body.from ? new Date(body.from) : request.dates.from;
    const to = body.to ? new Date(body.to) : request.dates.to;
    const newDays = body.durationDays ?? this._calcDays(from, to);
    request.dates = { from, to } as any;
    request.durationDays = newDays;
    if (body.justification) request.justification = body.justification;
    await request.save();
    // Adjust entitlement pending
    if (newDays !== oldDays) {
      const diff = newDays - oldDays;
      if (diff > 0)
        await this._addPending(request.employeeId, request.leaveTypeId, diff);
      else
        await this._subtractPending(
          request.employeeId,
          request.leaveTypeId,
          -diff,
        );
    }
    return request;
  }

  async cancelRequest(requestId: string) {
    const request = await this.leaveRequestModel.findById(requestId);
    if (!request) throw new NotFoundException('Leave request not found');
    if (
      request.status !== LeaveStatus.PENDING &&
      request.status !== LeaveStatus.APPROVED
    )
      throw new BadRequestException(
        'Only pending/approved requests can be canceled',
      );
    const wasApproved = request.status === LeaveStatus.APPROVED;
    request.status = LeaveStatus.CANCELLED;
    await request.save();
    // Revert entitlement if approved
    if (wasApproved) {
      await this._revertTaken(
        request.employeeId,
        request.leaveTypeId,
        request.durationDays,
      );
    } else {
      await this._subtractPending(
        request.employeeId,
        request.leaveTypeId,
        request.durationDays,
      );
    }
    return request;
  }

  private async _revertTaken(
    employeeId: Types.ObjectId | string,
    leaveTypeId: Types.ObjectId | string,
    days: number,
  ) {
    const ent = await this.entitlementModel.findOne({
      employeeId,
      leaveTypeId,
    });
    if (!ent) throw new NotFoundException('Entitlement not found');
    ent.taken = Math.max(0, (ent.taken ?? 0) - days);
    ent.remaining =
      (ent.yearlyEntitlement ?? 0) +
      (ent.accruedRounded ?? 0) +
      (ent.carryForward ?? 0) -
      ent.taken -
      (ent.pending ?? 0);
    await ent.save();
  }

  /**
   * Auto-escalate pending requests to next role if timeout passed.
   * This should be invoked by a scheduler (e.g., Cron job).
   */
  async autoEscalatePendingRequests() {
    const now = new Date();
    const pending = await this.leaveRequestModel.find({
      status: LeaveStatus.PENDING,
      escalateAt: { $lte: now },
      escalatedTo: { $exists: false },
    });
    for (const r of pending) {
      // Find next step in workflow
      const idx = r.approvalFlow.findIndex((s) => s.status === 'PENDING');
      if (idx === -1) continue;
      // TODO: Determine escalate user from Org Structure; fallback: set escalatedTo as HR role placeholder
      r.escalatedTo = undefined as any; // leave null so UI can show escalation needed
      // Update escalateAt to some future time to avoid reprocessing immediately
      const nextTimeoutHours = 24;
      r.escalateAt = new Date(now.getTime() + nextTimeoutHours * 3600 * 1000);
      await r.save();
      this.logger.warn(`Auto-escalated leave request ${r._id}`);
    }
  }

  /**
   * Carry over unused balances according to policy. This should be run at the policy reset date
   * (e.g., yearly job run by scheduler).
   */
  async applyCarryForward() {
    const entitlements = await this.entitlementModel.find({});
    for (const ent of entitlements) {
      const policy = await this.leavePolicyModel.findOne({
        leaveTypeId: ent.leaveTypeId,
      });
      if (!policy) continue;
      if (!policy.carryForwardAllowed) continue;
      const carry = Math.min(ent.remaining ?? 0, policy.maxCarryForward ?? 0);
      ent.carryForward = carry;
      ent.nextResetDate = new Date(new Date().getFullYear() + 1, 0, 1);
      await ent.save();
    }
  }

  /* =========================
   * HR: Adjust & Reports
   * ========================= */
  async manualAdjustBalance(dto: AdjustBalanceDto) {
    // Create an adjustment audit record
    const adjustment = new this.adjustmentModel(dto as any);
    await adjustment.save();

    // Update entitlement
    await this._applyAdjustment(dto.employeeId, dto.leaveTypeId, dto.amount);
    this.logger.log(
      `Manual adjustment for ${dto.employeeId} ${dto.leaveTypeId} by ${dto.hrUserId} amount ${dto.amount}`,
    );
    return adjustment;
  }

  async getIrregularLeaveReport(managerId: string) {
    // TODO: integrate with Org Structure & Employee Profile to fetch team members by managerId
    // Example: const team = await orgStructureService.getTeamByManager(managerId)
    // For now, search leaves with irregularPatternFlag and created by employees reporting to managerId
    // We'll return all irregular leaves as a fallback
    const report = await this.leaveRequestModel
      .find({ irregularPatternFlag: true })
      .lean();
    return report;
  }

  /**
   * Retrieve leave types
   */
  async getLeaveTypes() {
    return this.leaveTypeModel.find().lean();
  }

  async updateLeaveType(id: string, payload: any) {
    const t = await this.leaveTypeModel.findById(id);
    if (!t) throw new NotFoundException('Type not found');
    Object.assign(t, payload);
    return t.save();
  }

  async getRequestsByEmployee(employeeId: string) {
    return this.leaveRequestModel.find({ employeeId }).lean();
  }

  async getTeamLeaves(managerId: string) {
    // TODO: query org structure for team members, then fetch requests.
    const leaves = await this.leaveRequestModel.find({}).lean();
    return leaves;
  }

  /* =========================
   * Helpers and Business Rules
   * ========================= */
  private async _getDefaultWorkflow(): Promise<ApprovalWorkflowDocument> {
    const wf = await this.workflowModel.findOne({ active: true }).lean();
    if (wf) return wf as any;
    // If not configured, return default Manager -> HR
    return new this.workflowModel({
      name: 'Default-Manager-HR',
      steps: [
        { role: 'Manager', actionRequired: 'APPROVE', timeoutHours: 48 },
        { role: 'HR', actionRequired: 'APPROVE' },
      ],
      active: true,
    });
  }

  private async _overlapsHoliday(from: Date, to: Date) {
    const holidays = await this.holidayModel
      .find({ date: { $gte: from, $lte: to } })
      .lean();
    return holidays && holidays.length > 0;
  }

  private async _overlapsBlockedPeriod(from: Date, to: Date): Promise<boolean> {
    const calendars = await this.calendarModel
      .find({ 'blockedPeriods.from': { $lte: to } })
      .lean();
    for (const cal of calendars) {
      for (const b of cal.blockedPeriods) {
        if (!(new Date(b.to) < from || new Date(b.from) > to)) return true;
      }
    }
    return false;
  }

  private _calcDays(from: Date, to: Date) {
    const ms = to.getTime() - from.getTime();
    return Math.round(ms / (24 * 60 * 60 * 1000)) + 1;
  }

  private async _addPending(
    employeeId: string | Types.ObjectId,
    leaveTypeId: string | Types.ObjectId,
    days: number,
  ) {
    const ent = await this.entitlementModel.findOne({
      employeeId,
      leaveTypeId,
    });
    if (!ent) throw new NotFoundException('Entitlement not found');
    ent.pending = (ent.pending ?? 0) + days;
    await ent.save();
  }

  private async _subtractPending(
    employeeId: Types.ObjectId | string,
    leaveTypeId: Types.ObjectId | string,
    days: number,
  ) {
    const ent = await this.entitlementModel.findOne({
      employeeId,
      leaveTypeId,
    });
    if (!ent) throw new NotFoundException('Entitlement not found');
    ent.pending = Math.max(0, (ent.pending ?? 0) - days);
    await ent.save();
  }

  private async _applyTaken(
    employeeId: Types.ObjectId | string,
    leaveTypeId: Types.ObjectId | string,
    days: number,
  ) {
    const ent = await this.entitlementModel.findOne({
      employeeId,
      leaveTypeId,
    });
    if (!ent) throw new NotFoundException('Entitlement not found');
    ent.pending = Math.max(0, (ent.pending ?? 0) - days);
    ent.taken = (ent.taken ?? 0) + days;
    ent.remaining =
      (ent.yearlyEntitlement ?? 0) +
      (ent.accruedRounded ?? 0) +
      (ent.carryForward ?? 0) -
      ent.taken -
      (ent.pending ?? 0);
    await ent.save();
  }

  private async _applyAdjustment(
    employeeId: Types.ObjectId | string,
    leaveTypeId: Types.ObjectId | string,
    amount: number,
  ) {
    const ent = await this.entitlementModel.findOne({
      employeeId,
      leaveTypeId,
    });
    if (!ent) throw new NotFoundException('Entitlement not found');
    ent.yearlyEntitlement = (ent.yearlyEntitlement ?? 0) + amount;
    ent.remaining =
      (ent.yearlyEntitlement ?? 0) +
      (ent.accruedRounded ?? 0) +
      (ent.carryForward ?? 0) -
      (ent.taken ?? 0) -
      (ent.pending ?? 0);
    await ent.save();
  }

  private async _applyAccrualIfDue(
    ent: any,
    policy: LeavePolicyDocument,
    now: Date,
  ) {
    if (!policy) return;
    // Basic implementation: if accrual method is monthly, apply monthlyRate since last accrual
    const last = ent.lastAccrualDate ? new Date(ent.lastAccrualDate) : null;
    if (
      policy.accrualMethod === AccrualMethod.MONTHLY &&
      policy.monthlyRate &&
      (!last || last < now)
    ) {
      // Rough implementation: add monthlyRate for months difference
      const months = last ? this._monthDiff(last, now) : 1;
      ent.accruedActual =
        (ent.accruedActual ?? 0) + months * policy.monthlyRate;
      // Apply rounding rule
      ent.accruedRounded = Math.round(ent.accruedActual);
      ent.lastAccrualDate = now;
      await this.entitlementModel
        .updateOne({ _id: ent._id }, { $set: ent })
        .exec();
    }
  }

  private _monthDiff(d1: Date, d2: Date) {
    return (
      d2.getMonth() - d1.getMonth() + 12 * (d2.getFullYear() - d1.getFullYear())
    );
  }
}
