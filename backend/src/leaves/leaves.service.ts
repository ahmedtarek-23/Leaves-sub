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
  ManagerApprovalDto,
  HrApprovalDto,
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

  async listCategories() {
    return this.catModel.find();
  }

  async createLeaveType(dto: CreateLeaveTypeDto) {
    console.log('Creating LeaveType with DTO:', dto);
    const cat = await this.catModel.findById(dto.categoryId);
    if (!cat) throw new NotFoundException('LeaveCategory not found');
    return this.ltModel.create(dto);
  }

  async listLeaveTypes() {
    return this.ltModel.find();
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
    const empObjId = typeof dto.employeeId === 'string' ? new Types.ObjectId(dto.employeeId) : dto.employeeId;
    const ltObjId = typeof dto.leaveTypeId === 'string' ? new Types.ObjectId(dto.leaveTypeId) : dto.leaveTypeId;
    const exists = await this.entModel.findOne({
      employeeId: empObjId,
      leaveTypeId: ltObjId,
    });
    if (exists) throw new BadRequestException('Entitlement already exists');
    return this.entModel.create(dto);
  }

  async getEntitlement(employeeId: string) {
    return this.entModel.find({ employeeId: new Types.ObjectId(employeeId) }).populate('leaveTypeId');
  }

  async listEntitlements() {
    return this.entModel.find().populate('leaveTypeId').populate('employeeId');
  }

  async updateEntitlement(id: string, dto: Partial<CreateEntitlementDto>) {
    return this.entModel.findByIdAndUpdate(id, dto, { new: true }).populate('leaveTypeId').populate('employeeId');
  }

  async manualAdjust(employeeId: string, dto: AdjustBalanceDto, hrUserId: string) {
    const empObjId = new Types.ObjectId(employeeId);
    const ltObjId = new Types.ObjectId(dto.leaveTypeId);
    let ent = await this.entModel.findOne({
      employeeId: empObjId,
      leaveTypeId: ltObjId,
    });
    
    // Create entitlement if it doesn't exist
    if (!ent) {
      ent = await this.entModel.create({
        employeeId: empObjId,
        leaveTypeId: ltObjId,
        entitled: 0,
        remaining: 0,
      });
    }
    
    const delta = dto.adjustmentType === AdjustmentType.ADD ? dto.amount : -dto.amount;
    ent.remaining += delta;
    await ent.save();
    
    await this.adjModel.create({
      employeeId: empObjId,
      leaveTypeId: ltObjId,
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

  async getCalendar(year: number) {
    const calendar = await this.calModel.findOne({ year });
    if (!calendar) {
      return { year, holidays: [], blockedPeriods: [] };
    }
    return {
      year: calendar.year,
      holidays: (calendar.holidays || []).map((d: any) => (d as Date).toISOString().split('T')[0]),
      blockedPeriods: (calendar.blockedPeriods || []).map((p: any) => ({
        from: (p.from as Date).toISOString().split('T')[0],
        to: (p.to as Date).toISOString().split('T')[0],
        reason: p.reason,
      })),
    };
  }

  /* =========================================================
     2. REQUEST WORKFLOW
     ========================================================= */

  private async calculateDuration(from: Date, to: Date): Promise<number> {
    // Ensure from and to are Date objects
    const fromDate = from instanceof Date ? from : new Date(from);
    const toDate = to instanceof Date ? to : new Date(to);
    
    const cal = await this.calModel.findOne({ year: fromDate.getFullYear() });
    const holidays = (cal?.holidays || []).map((d: any) => (d as Date).toISOString().split('T')[0]);
    let count = 0;
    
    const current = new Date(fromDate);
    while (current <= toDate) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) { // Not Saturday or Sunday
        if (!holidays.includes(current.toISOString().split('T')[0])) {
          count++;
        }
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  async submitRequest(dto: CreateLeaveRequestDto, employeeId: string) {
    try {
      const emp = await this.empModel.findById(employeeId);
      if (!emp) throw new NotFoundException('Employee not found');
      
      const leaveType = await this.ltModel.findById(dto.leaveTypeId);
      if (!leaveType) throw new NotFoundException('LeaveType not found');
      
      const durationDays = await this.calculateDuration(dto.dates.from, dto.dates.to);
      
      // Convert to ObjectId for matching with database documents
      const employeeObjectId = new Types.ObjectId(employeeId);
      const leaveTypeObjectId = new Types.ObjectId(dto.leaveTypeId);
      
      const entitlement = await this.entModel.findOne({ employeeId: employeeObjectId, leaveTypeId: leaveTypeObjectId });
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
      
      const reqData = {
        employeeId,
        leaveTypeId: dto.leaveTypeId,
        dates: {
          from: dto.dates.from instanceof Date ? dto.dates.from : new Date(dto.dates.from),
          to: dto.dates.to instanceof Date ? dto.dates.to : new Date(dto.dates.to),
        },
        durationDays,
        justification: dto.justification,
        attachmentId: dto.attachmentId,
      };
      
      const req = await this.lrModel.create(reqData);

      const dept = await this.deptModel.findById(emp.primaryDepartmentId);
      const manager = dept && dept.headPositionId ? await this.empModel.findOne({ primaryPositionId: dept.headPositionId }) : null;
      
      await this.notifier.requestSubmitted(
        req,
        emp.workEmail ?? '',
        manager?.workEmail ?? '',
      );
      
      return req;
    } catch (error) {
      console.error('Error in submitRequest:', error);
      throw error;
    }
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
    
    // Allow both department heads and HR managers to approve/reject
    // (we removed the strict department head check to allow HR managers to manage all leaves)
    
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

  async bulkReject(ids: string[], managerUserId: string, reason?: string) {
    const results: any[] = [];
    for (const id of ids) {
      results.push(await this.managerAction(id, { action: 'REJECT', reason }, managerUserId));
    }
    return results;
  }

  /**
   * MANAGER APPROVAL (FIRST LEVEL)
   * Manager reviews the leave request and approves or rejects it
   */
  async managerApprove(id: string, dto: ManagerApprovalDto, managerUserId: string) {
    const req = await this.lrModel.findById(id).populate('employeeId');
    if (!req) throw new NotFoundException('Request not found');
    const emp = req.employeeId as any;

    // Set manager approval status
    req.managerApprovalStatus = dto.action;
    req.managerApprovedAt = new Date();
    req.managerApprovedBy = new Types.ObjectId(managerUserId);
    if (dto.action === 'REJECTED') {
      req.managerRejectionReason = dto.reason;
    }

    // Add to approval flow history
    req.approvalFlow.push({
      role: 'MANAGER',
      status: dto.action,
      decidedBy: new Types.ObjectId(managerUserId),
      decidedAt: new Date(),
    });

    await req.save();

    // Send notification
    if (dto.action === 'APPROVED') {
      await this.notifier.managerApproved(req, emp.workEmail);
    } else {
      await this.notifier.managerRejected(req, emp.workEmail);
    }

    return req;
  }

  /**
   * HR APPROVAL (FINAL LEVEL - OVERRIDES MANAGER)
   * HR admin makes the final decision
   * If HR approves, the leave is approved (regardless of manager's decision)
   * If HR rejects, the leave is rejected (overrides manager approval)
   */
  async hrApprove(id: string, dto: HrApprovalDto, hrUserId: string) {
    const req = await this.lrModel.findById(id).populate('employeeId');
    if (!req) throw new NotFoundException('Request not found');
    const emp = req.employeeId as any;

    // Set HR approval status
    req.hrApprovalStatus = dto.action;
    req.hrApprovedAt = new Date();
    req.hrApprovedBy = new Types.ObjectId(hrUserId);
    if (dto.action === 'REJECTED') {
      req.hrRejectionReason = dto.reason;
    }

    // Set final status based on HR decision
    req.status = dto.action === 'APPROVED' ? LeaveStatus.APPROVED : LeaveStatus.REJECTED;

    // Add to approval flow history
    req.approvalFlow.push({
      role: 'HR',
      status: dto.action,
      decidedBy: new Types.ObjectId(hrUserId),
      decidedAt: new Date(),
    });

    await req.save();

    // If approved, deduct from entitlements
    if (req.status === LeaveStatus.APPROVED) {
      const ent = await this.entModel.findOne({
        employeeId: req.employeeId,
        leaveTypeId: req.leaveTypeId,
      });
      if (ent) {
        ent.taken += req.durationDays;
        ent.remaining -= req.durationDays;
        await ent.save();
      }
      // Send approval notification
      try {
        await this.notifier.managerApproved(req, emp.workEmail);
      } catch (err) {
        console.warn('Could not send approval notification:', err);
      }
    } else {
      // Send rejection notification
      try {
        await this.notifier.managerRejected(req, emp.workEmail);
      } catch (err) {
        console.warn('Could not send rejection notification:', err);
      }
    }

    return req;
  }

  /* =========================================================
     3. TRACKING
     ========================================================= */

  async getEmployeeBalance(employeeId: string) {
    return this.entModel.find({ employeeId: new Types.ObjectId(employeeId) }).populate('leaveTypeId');
  }

  async getEmployeeRequests(employeeId: string, filters: ListRequestsFilterDto) {
    const q: any = { employeeId };
    if (filters.status) q.status = filters.status;
    if (filters.from || filters.to) {
      q['dates.from'] = {};
      if (filters.from) q['dates.from'].$gte = new Date(filters.from);
      if (filters.to) q['dates.from'].$lte = new Date(filters.to);
    }
    return this.lrModel
      .find(q)
      .populate('leaveTypeId')
      .populate('employeeId')
      .sort({ 'dates.from': -1 });
  }

  async getTeamRequests(managerUserId: string) {
    // First, check if user is a department head
    const dept = await this.deptModel.findOne({ headId: managerUserId });
    
    if (dept) {
      // User is a department head - return only their department's requests
      const employees = await this.empModel.find({ primaryDepartmentId: dept._id });
      const ids = employees.map((e) => e._id);
      return this.lrModel
        .find({ employeeId: { $in: ids } })
        .populate('employeeId', 'firstName lastName')
        .populate('leaveTypeId')
        .sort({ 'dates.from': -1 });
    } else {
      // User is not a department head (e.g., HR Manager) - return all pending/approved requests
      return this.lrModel
        .find({ status: { $in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] } })
        .populate('employeeId', 'firstName lastName')
        .populate('leaveTypeId')
        .sort({ 'dates.from': -1 });
    }
  }

  async getTeamRequestsWithFilters(managerUserId: string, filters: ListRequestsFilterDto) {
    // First, check if user is a department head
    const dept = await this.deptModel.findOne({ headId: managerUserId });
    
    // Build query
    let query: any = {};
    
    // Determine which employees to include
    if (dept) {
      // User is a department head - only their department's employees
      const employees = await this.empModel.find({ primaryDepartmentId: dept._id });
      const ids = employees.map((e) => e._id);
      query.employeeId = { $in: ids };
    } else if (filters.departmentId) {
      // HR Manager filtering by department
      const employees = await this.empModel.find({ primaryDepartmentId: filters.departmentId });
      const ids = employees.map((e) => e._id);
      query.employeeId = { $in: ids };
    } else {
      // HR Manager with no department filter - all requests
      query.status = { $in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] };
    }

    // Apply status filter
    if (filters.status) {
      query.status = filters.status;
    }

    // Apply leave type filter
    if (filters.leaveTypeId) {
      query.leaveTypeId = filters.leaveTypeId;
    }

    // Apply date range filter
    if (filters.from || filters.to) {
      query['dates.from'] = {};
      if (filters.from) query['dates.from'].$gte = filters.from;
      if (filters.to) query['dates.to'] = { ...query['dates.to'], $lte: filters.to };
    }

    // Apply sorting
    let sortObj: any = { 'dates.from': -1 }; // Default sort
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'date':
          sortObj = { 'dates.from': filters.sortOrder === 'asc' ? 1 : -1 };
          break;
        case 'status':
          sortObj = { status: filters.sortOrder === 'asc' ? 1 : -1 };
          break;
        case 'employee':
          sortObj = { employeeId: filters.sortOrder === 'asc' ? 1 : -1 };
          break;
        case 'type':
          sortObj = { leaveTypeId: filters.sortOrder === 'asc' ? 1 : -1 };
          break;
      }
    }

    return this.lrModel
      .find(query)
      .populate('employeeId', 'firstName lastName primaryDepartmentId')
      .populate('leaveTypeId')
      .populate({
        path: 'employeeId',
        populate: {
          path: 'primaryDepartmentId',
          select: 'name',
        },
      })
      .sort(sortObj);
  }

  async getTeamBalances(managerUserId: string) {
    // First, check if user is a department head
    const dept = await this.deptModel.findOne({ headId: managerUserId });
    
    if (dept) {
      // User is a department head - return only their department's balances
      const employees = await this.empModel.find({ primaryDepartmentId: dept._id });
      const ids = employees.map((e) => e._id);
      return this.entModel
        .find({ employeeId: { $in: ids } })
        .populate('leaveTypeId')
        .populate('employeeId', 'firstName lastName');
    } else {
      // User is not a department head (e.g., HR Manager) - return all employee balances
      return this.entModel
        .find({})
        .populate('leaveTypeId')
        .populate('employeeId', 'firstName lastName');
    }
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