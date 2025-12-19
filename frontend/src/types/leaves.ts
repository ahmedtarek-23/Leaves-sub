export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum AccrualMethod {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  PER_TERM = 'per-term',
}

export enum AdjustmentType {
  ADD = 'add',
  DEDUCT = 'deduct',
  ENCASHMENT = 'encashment',
}

export enum RoundingRule {
  NONE = 'none',
  ROUND = 'round',
  ROUND_UP = 'round_up',
  ROUND_DOWN = 'round_down',
}

export interface LeaveType {
  _id: string;
  code: string;
  name: string;
  categoryId: string;
  description?: string;
  paid: boolean;
  deductible: boolean;
  requiresAttachment: boolean;
  attachmentType?: string;
  minTenureMonths?: number;
  maxDurationDays?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeavePolicy {
  _id: string;
  leaveTypeId: string | LeaveType;
  accrualMethod: AccrualMethod;
  monthlyRate: number;
  yearlyRate: number;
  carryForwardAllowed: boolean;
  maxCarryForward: number;
  expiryAfterMonths?: number;
  roundingRule: RoundingRule;
  minNoticeDays: number;
  maxConsecutiveDays?: number;
  eligibility?: Record<string, any>;
}

export interface LeaveEntitlement {
  _id: string;
  employeeId: string;
  leaveTypeId: string | LeaveType;
  year: number;
  yearlyEntitlement: number;
  accruedActual: number;
  accruedRounded: number;
  carryForward: number;
  taken: number;
  pending: number;
  remaining: number;
  lastAccrualDate?: string;
  nextResetDate?: string;
}

export interface DateRange {
  from: string | Date;
  to: string | Date;
}

export interface LeaveRequest {
  _id: string;
  employeeId: string;
  leaveTypeId: string | LeaveType;
  leavePolicyId?: string;
  status: LeaveStatus;
  dates: DateRange;
  totalDays: number;
  justification?: string;
  attachmentId?: string;
  managerApproval?: {
    managerId: string;
    status: LeaveStatus;
    actionDate: string;
    reason?: string;
  };
  hrVerification?: {
    hrId: string;
    verified: boolean;
    verificationDate: string;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveTypeDto {
  code: string;
  name: string;
  categoryId: string;
  description?: string;
  paid?: boolean;
  deductible?: boolean;
  requiresAttachment?: boolean;
  attachmentType?: string;
  minTenureMonths?: number;
  maxDurationDays?: number;
}

export interface CreatePolicyDto {
  leaveTypeId: string;
  accrualMethod?: AccrualMethod;
  monthlyRate?: number;
  yearlyRate?: number;
  carryForwardAllowed?: boolean;
  maxCarryForward?: number;
  expiryAfterMonths?: number;
  roundingRule?: RoundingRule;
  minNoticeDays?: number;
  maxConsecutiveDays?: number;
  eligibility?: Record<string, any>;
}

export interface CreateEntitlementDto {
  employeeId: string;
  leaveTypeId: string;
  yearlyEntitlement?: number;
  accruedActual?: number;
  accruedRounded?: number;
  carryForward?: number;
  taken?: number;
  pending?: number;
  remaining?: number;
  lastAccrualDate?: Date;
  nextResetDate?: Date;
}

export interface CreateLeaveRequestDto {
  leaveTypeId: string;
  dates: {
    from: string | Date;
    to: string | Date;
  };
  justification?: string;
  attachmentId?: string;
}

export interface ListRequestsFilterDto {
  status?: LeaveStatus;
  from?: string | Date;
  to?: string | Date;
}

export interface ManualAdjustmentDto {
  leaveTypeId: string;
  adjustmentType: AdjustmentType;
  amount: number;
  reason: string;
}
