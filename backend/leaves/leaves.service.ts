import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveType, LeaveTypeDocument } from './models/leave-type.schema';
import { LeavePolicy, LeavePolicyDocument } from './models/leave-policy.schema';
import { LeaveEntitlement, LeaveEntitlementDocument } from './models/leave-entitlement.schema';
import { LeaveRequest, LeaveRequestDocument } from './models/leave-request.schema';
import { LeaveAdjustment, LeaveAdjustmentDocument } from './models/leave-adjustment.schema';
import { LeaveCategory, LeaveCategoryDocument } from './models/leave-category.schema';
import { Calendar, CalendarDocument } from './models/calendar.schema';
import { EmployeeProfile, EmployeeProfileDocument } from '../employee-profile/models/employee-profile.schema';
import { Department, DepartmentDocument } from '../organization-structure/models/department.schema';
import { LeaveStatus } from './enums/leave-status.enum';
import { AdjustmentType } from './enums/adjustment-type.enum';
import { AccrualMethod } from './enums/accrual-method.enum';
import { LeavesNotifications } from './leaves.notifications';

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
  ListRequestsFilterDto,
} from './dto';


@Injectable()
export class LeaveService {
  constructor(
    @InjectModel(LeaveType.name) private ltModel: Model<LeaveTypeDocument>,
    @InjectModel(LeavePolicy.name) private lpModel: Model<LeavePolicyDocument>,
    @InjectModel(LeaveEntitlement.name) private entModel: Model<LeaveEntitlementDocument>,
    @InjectModel(LeaveRequest.name) private lrModel: Model<LeaveRequestDocument>,
    @InjectModel(LeaveAdjustment.name) private adjModel: Model<LeaveAdjustmentDocument>,
    @InjectModel(LeaveCategory.name) private catModel: Model<LeaveCategoryDocument>,
    @InjectModel(Calendar.name) private calModel: Model<CalendarDocument>,
    @InjectModel(EmployeeProfile.name) private empModel: Model<EmployeeProfileDocument>,
    @InjectModel(Department.name) private deptModel: Model<DepartmentDocument>,
    private readonly notifier: LeavesNotifications,
  ) {}

  /* =========================================================
     1. POLICY SET-UP
     ========================================================= */

  async createLeaveType(dto: CreateLeaveTypeDto) {
    const cat = await this.catModel.findById(dto.categoryId);
    if (!cat) throw new NotFoundException('LeaveCategory not found');
    return this.ltModel.create(dto);
  }

  async listLeaveTypes() {
    return this.ltModel.find().populate('categoryId');
  }

  async updateLeaveType(id: string, dto: UpdateLeaveTypeDto) {
    return this.ltModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async createPolicy(dto: CreatePolicyDto) {
    return this.lpModel.create(dto);
  }

  async listPolicies() {
    return this.lpModel.find().populate('leaveTypeId');
  }

  async updatePolicy(id: string, dto: UpdatePolicyDto) {
    return this.lpModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async createEntitlement(dto: CreateEntitlementDto) {
    const exists = await this.entModel.findOne({
      employeeId: dto.employeeId,
      leaveTypeId: dto.leaveTypeId,
    });
    if (exists) throw new BadRequestException('Entitlement already exists');
    return this.entModel.create(dto);
  }

  async getEntitlement(employeeId: string) {
    return this.entModel.find({ employeeId }).populate('leaveTypeId');
  }

  async manualAdjust(employeeId: string, dto: AdjustBalanceDto, hrUserId: string) {
    const ent = await this.entModel.findOne({
      employeeId,
      leaveTypeId: dto.leaveTypeId,
    });
    if (!ent) throw new NotFoundException('Entitlement not found');
    const delta = dto.adjustmentType === AdjustmentType.ADD ? dto.amount : -dto.amount;
    ent.remaining += delta;
    await ent.save();
    await this.adjModel.create({
      employeeId,
      leaveTypeId: dto.leaveTypeId,
      adjustmentType: dto.adjustmentType,
      amount: dto.amount,
      reason: dto.reason,
      hrUserId,
    });
    return ent;
  }

  async createCalendar(year: number, holidays: Date[], blockedPeriods: { from: Date; to: Date; reason: string }[]) {
    return this.calModel.findOneAndUpdate(
      { year },
      { holidays, blockedPeriods },
      { upsert: true, new: true },
    );
  }

  /* =========================================================
     2. REQUEST WORKFLOW
     ========================================================= */

  private async calculateDuration(from: Date, to: Date): Promise<number> {
    const cal = await this.calModel.findOne({ year: from.getFullYear() });
    const holidays = (cal?.holidays || []).map((d: any) => (d as Date).toISOString().split('T')[0]);
    let count = 0;
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day === 0 || day === 6) continue;
      if (holidays.includes(d.toISOString().split('T')[0])) continue;
      count++;
    }
    return count;
  }

  async submitRequest(dto: CreateLeaveRequestDto, employeeId: string) {
    const emp = await this.empModel.findById(employeeId);
    if (!emp) throw new NotFoundException('Employee not found');
    const leaveType = await this.ltModel.findById(dto.leaveTypeId);
    if (!leaveType) throw new NotFoundException('LeaveType not found');
    const durationDays = await this.calculateDuration(dto.dates.from, dto.dates.to);
    const entitlement = await this.entModel.findOne({ employeeId, leaveTypeId: dto.leaveTypeId });
    if (!entitlement) throw new BadRequestException('No entitlement for this leave type');
    if (entitlement.remaining < durationDays && leaveType.deductible) {
      throw new BadRequestException('Insufficient balance');
    }
    const overlap = await this.lrModel.findOne({
      employeeId,
      status: LeaveStatus.APPROVED,
      $or: [{ 'dates.from': { $lte: dto.dates.to }, 'dates.to': { $gte: dto.dates.from } }],
    });
    if (overlap) throw new BadRequestException('Overlapping approved leave');
    const req = await this.lrModel.create({ ...dto, employeeId, durationDays });

    const dept = await this.deptModel.findById(emp.primaryDepartmentId);
    const manager = dept ? await this.empModel.findById((dept as any).headId) : null;
await this.notifier.requestSubmitted(
  req,
  emp.workEmail ?? '',
  manager?.workEmail ?? '',
);    return req;
  }

  async modifyRequest(id: string, dto: UpdateLeaveRequestDto, userId: string) {
    const req = await this.lrModel.findOne({ _id: id, employeeId: userId });
    if (!req) throw new NotFoundException('Request not found');
    if (req.status !== LeaveStatus.PENDING) throw new BadRequestException('Can only modify pending requests');
    Object.assign(req, dto);
    if (dto.dates) req.durationDays = await this.calculateDuration(dto.dates.from, dto.dates.to);
    return req.save();
  }

  async cancelRequest(id: string, userId: string) {
    const req = await this.lrModel.findOne({ _id: id, employeeId: userId });
    if (!req) throw new NotFoundException('Request not found');
    if (req.status !== LeaveStatus.PENDING) throw new BadRequestException('Can only cancel pending requests');
    req.status = LeaveStatus.CANCELLED;
    return req.save();
  }

  async managerAction(id: string, dto: ApproveRejectDto, managerUserId: string) {
    const req = await this.lrModel.findById(id).populate('employeeId');
    if (!req) throw new NotFoundException('Request not found');
    const emp = req.employeeId as any;
    const dept = await this.deptModel.findById(emp.primaryDepartmentId);
    if (!dept || (dept as any).headId?.toString() !== managerUserId) {
      throw new BadRequestException('You are not the line manager for this employee');
    }
    req.status = dto.action === 'APPROVE' ? LeaveStatus.APPROVED : LeaveStatus.REJECTED;
    req.approvalFlow.push({
      role: 'MANAGER',
      status: req.status,
      decidedBy: new Types.ObjectId(managerUserId),
      decidedAt: new Date(),
    });
    await req.save();

    if (req.status === LeaveStatus.APPROVED) {
      await this.notifier.managerApproved(req, emp.workEmail);
    } else {
      await this.notifier.managerRejected(req, emp.workEmail);
    }
    return req;
  }

  async hrFinalize(id: string, dto: HrFinalizeDto, hrUserId: string) {
    const req = await this.lrModel.findById(id);
    if (!req) throw new NotFoundException('Request not found');
    if (dto.override && dto.finalStatus) req.status = dto.finalStatus;
    else if (req.status !== LeaveStatus.APPROVED) throw new BadRequestException('Manager approval required');
    req.approvalFlow.push({
      role: 'HR',
      status: req.status,
      decidedBy: new Types.ObjectId(hrUserId),
      decidedAt: new Date(),
    });
    await req.save();

    if (req.status === LeaveStatus.APPROVED) {
      const ent = await this.entModel.findOne({ employeeId: req.employeeId, leaveTypeId: req.leaveTypeId });
      if (ent) {
        ent.taken += req.durationDays;
        ent.remaining -= req.durationDays;
        await ent.save();
      }
    }

    const emp = await this.empModel.findById(req.employeeId);
    const dept = await this.deptModel.findById((emp as any).primaryDepartmentId);
    const manager = dept ? await this.empModel.findById((dept as any).headId) : null;
await this.notifier.hrFinalized(
  req,
  emp?.workEmail ?? '',
  manager?.workEmail ?? '',
);    return req;
  }

  async bulkApprove(ids: string[], managerUserId: string) {
    const results: any[] = [];
    for (const id of ids) {
      results.push(await this.managerAction(id, { action: 'APPROVE' }, managerUserId));
    }
    return results;
  }

  /* =========================================================
     3. TRACKING
     ========================================================= */

  async getEmployeeBalance(employeeId: string) {
    return this.entModel.find({ employeeId }).populate('leaveTypeId');
  }

  async getEmployeeRequests(employeeId: string, filters: ListRequestsFilterDto) {
    const q: any = { employeeId };
    if (filters.status) q.status = filters.status;
    if (filters.from || filters.to) {
      q['dates.from'] = {};
      if (filters.from) q['dates.from'].$gte = new Date(filters.from);
      if (filters.to) q['dates.from'].$lte = new Date(filters.to);
    }
    return this.lrModel.find(q).sort({ 'dates.from': -1 });
  }

  async getTeamRequests(managerUserId: string) {
    const dept = await this.deptModel.findOne({ headId: managerUserId });
    if (!dept) throw new NotFoundException('Not head of any department');
    const employees = await this.empModel.find({ primaryDepartmentId: dept._id });
    const ids = employees.map((e) => e._id);
    return this.lrModel
      .find({ employeeId: { $in: ids } })
      .populate('employeeId', 'firstName lastName')
      .sort({ 'dates.from': -1 });
  }

  async getTeamBalances(managerUserId: string) {
    const dept = await this.deptModel.findOne({ headId: managerUserId });
    if (!dept) throw new NotFoundException('Not head of any department');
    const employees = await this.empModel.find({ primaryDepartmentId: dept._id });
    const ids = employees.map((e) => e._id);
    return this.entModel
      .find({ employeeId: { $in: ids } })
      .populate('leaveTypeId')
      .populate('employeeId', 'firstName lastName');
  }

  async getAdjustmentLog(employeeId: string) {
    return this.adjModel
      .find({ employeeId })
      .populate('hrUserId', 'firstName lastName')
      .sort({ createdAt: -1 });
  }

  /* =========================================================
     4. BATCH JOBS
     ========================================================= */

  async runAccrual() {
    const employees = await this.empModel.find();
    const results: any[] = [];
    for (const emp of employees) {
      const policies = await this.lpModel.find();
      for (const pol of policies) {
        const ent = await this.entModel.findOne({ employeeId: emp._id, leaveTypeId: pol.leaveTypeId });
        if (!ent) continue;
        const months = this.monthsBetween(ent.lastAccrualDate || emp.dateOfHire, new Date());
        let accrued = 0;
        if (pol.accrualMethod === AccrualMethod.MONTHLY) accrued = months * (pol.monthlyRate || 0);
        if (pol.accrualMethod === AccrualMethod.YEARLY) accrued = (pol.yearlyRate || 0) / 12 * months;
        const delta = accrued - ent.accruedActual;
        ent.accruedActual = accrued;
        ent.accruedRounded = Math.round(accrued);
        ent.remaining += delta;
        ent.lastAccrualDate = new Date();
        await ent.save();
        results.push({ employeeId: emp._id, leaveTypeId: pol.leaveTypeId, delta });
      }
    }
    return results;
  }

  async runCarryForward() {
    const ents = await this.entModel.find();
    const results: any[] = [];
    for (const ent of ents) {
      const pol = await this.lpModel.findOne({ leaveTypeId: ent.leaveTypeId });
      if (!pol?.carryForwardAllowed) continue;
      const max = pol.maxCarryForward || 45;
      const toCarry = Math.min(ent.remaining, max);
      ent.carryForward += toCarry;
      ent.remaining = toCarry;
      await ent.save();
      results.push({ employeeId: ent.employeeId, carried: toCarry });
    }
    return results;
  }

  /* =========================================================
     5. FLAG IRREGULAR
     ========================================================= */

  async flagIrregular(id: string, reason: string, managerId: string) {
    const req = await this.lrModel.findById(id).populate('employeeId');
    if (!req) throw new NotFoundException('Request not found');
    const emp = req.employeeId as any;
    const dept = await this.deptModel.findById(emp.primaryDepartmentId);
    if (!dept || (dept as any).headId?.toString() !== managerId)
      throw new BadRequestException('You are not the line manager');
    req.irregularPatternFlag = true;
    await req.save();
    return req;
  }

  /* =========================================================
     6. UTILS
     ========================================================= */

  private monthsBetween(start: Date, end: Date): number {
    return Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
  }
}