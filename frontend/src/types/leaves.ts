// Comprehensive Leave Management Types

// Enums
export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  ESCALATED = 'ESCALATED',
  ENCASHED = 'ENCASHED',
}

export enum AccrualMethod {
  MONTHLY = 'monthly',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'yearly',
  PER_TERM = 'per-term',
}

export enum AttachmentType {
  MEDICAL = 'medical',
  DOCUMENT = 'document',
  OTHER = 'other',
}

export enum AdjustmentType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
}

// System Roles (from backend)
export enum SystemRole {
  DEPARTMENT_EMPLOYEE = 'department employee',
  DEPARTMENT_HEAD = 'department head',
  HR_MANAGER = 'HR Manager',
  HR_EMPLOYEE = 'HR Employee',
  HR_ADMIN = 'HR Admin',
  PAYROLL_SPECIALIST = 'Payroll Specialist',
  SYSTEM_ADMIN = 'System Admin',
  LEGAL_POLICY_ADMIN = 'Legal & Policy Admin',
  RECRUITER = 'Recruiter',
  FINANCE_STAFF = 'Finance Staff',
  JOB_CANDIDATE = 'Job Candidate',
}

// Core Models
export interface LeaveType {
  _id: string;
  code: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  description?: string;
  paid: boolean;
  deductible: boolean;
  requiresAttachment: boolean;
  attachmentType?: AttachmentType;
  minTenureMonths?: number;
  maxDurationDays?: number;
  isActive: boolean;
}

export interface LeaveCategory {
  _id: string;
  name: string;
  description?: string;
}

export interface LeaveBalance {
  leaveTypeCode: string;
  leaveTypeName: string;
  leaveTypeId?: string;
  accrued: number;
  used: number;
  remaining: number;
  pending: number;
  carryOver?: number;
  yearlyEntitlement?: number;
  fiscalYear?: number;
}

export interface LeaveRequest {
  _id: string;
  employeeId: string;
  employeeName?: string;
  leaveTypeId: string;
  leaveTypeCode?: string;
  leaveTypeName?: string;
  startDate: string;
  endDate: string;
  dates: {
    from: string;
    to: string;
  };
  durationDays: number;
  actualDuration?: number;
  roundedDuration?: number;
  justification?: string;
  status: LeaveStatus;
  approvalFlow: ApprovalStep[];
  isSynced: boolean;
  syncedAt?: string;
  requiresHRConversion: boolean;
  irregularPatternFlag: boolean;
  excessDays: number;
  managerId?: string;
  managerName?: string;
  hasAttachments: boolean;
  attachments?: Attachment[];
  medicalVerified?: boolean;
  medicalVerifiedBy?: string;
  medicalVerifiedAt?: string;
  medicalVerificationComments?: string;
  flagged?: boolean;
  flagReason?: string;
  flagPriority?: 'LOW' | 'MEDIUM' | 'HIGH';
  flaggedBy?: string;
  flaggedAt?: string;
  isEscalated?: boolean;
  escalatedAt?: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
}

export interface ApprovalStep {
  role: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  decidedBy?: string;
  decidedByName?: string;
  decidedAt?: string;
  comments?: string;
}

export interface Attachment {
  _id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  uploadedBy: string;
  uploadedByName?: string;
  uploadedAt: string;
}

export interface LeaveEntitlement {
  _id: string;
  employeeId: string;
  leaveTypeId: string;
  leaveTypeCode?: string;
  leaveTypeName?: string;
  yearlyEntitlement: number;
  accruedActual: number;
  accruedRounded: number;
  carryForward: number;
  taken: number;
  pending: number;
  remaining: number;
  accrued: number;
  carriedOver: number;
  previousYearBalance: number;
  isActive: boolean;
  fiscalYear: number;
  lastAccrualDate?: string;
  nextResetDate?: string;
  lastCarryForwardDate?: string;
}

export interface LeavePolicy {
  _id: string;
  name: string;
  leaveTypeId: string;
  leaveTypeCode?: string;
  accrualMethod: AccrualMethod;
  accrualRate: number;
  maxCarryForward: number;
  carryForwardExpiryMonths?: number;
  resetDate?: string;
  requiresApproval: boolean;
  approvalFlow?: string[];
  payrollPayCode?: string;
  syncWithPayroll: boolean;
  syncWithTimeManagement: boolean;
  isActive: boolean;
}

export interface AccrualRecord {
  id: string;
  date: string;
  leaveTypeCode: string;
  leaveTypeName: string;
  amount: number;
  reason?: string;
  adjustmentType?: AdjustmentType;
  adjustedBy?: string;
}

export interface YearEndResult {
  fiscalYear: number;
  carriedForward: number;
  expired: number;
  encashmentAmount?: number;
  encashmentDays?: number;
  dailySalaryRate?: number;
  notes?: string;
}

// Legacy type for backward compatibility
export type YearEndSummary = YearEndResult;

// DTOs for API requests
export interface CreateLeaveRequestDto {
  employeeId: string;
  leaveTypeId: string;
  dates: {
    from: string;
    to: string;
  };
  justification?: string;
  isPostLeave?: boolean;
}

export interface ReviewLeaveRequestDto {
  approverId: string;
  action: 'APPROVE' | 'REJECT' | 'OVERRIDE';
  isHR: boolean;
  comments?: string;
  reason?: string;
}

export interface ManualAdjustmentDto {
  employeeId: string;
  typeCode: string;
  amount: number;
  justification: string;
}

export interface CreateLeaveTypeDto {
  code: string;
  name: string;
  categoryId: string;
  description?: string;
  paid: boolean;
  deductible: boolean;
  requiresAttachment: boolean;
  attachmentType?: AttachmentType;
  minTenureMonths?: number;
  maxDurationDays?: number;
}

export interface CreateLeavePolicyDto {
  name: string;
  leaveTypeId: string;
  accrualMethod: AccrualMethod;
  accrualRate: number;
  maxCarryForward: number;
  carryForwardExpiryMonths?: number;
  resetDate?: string;
  requiresApproval: boolean;
  approvalFlow?: string[];
  payrollPayCode?: string;
  syncWithPayroll: boolean;
  syncWithTimeManagement: boolean;
}

export interface Holiday {
  _id: string;
  name: string;
  date: string;
  isRecurring: boolean;
  country?: string;
}

export interface BlockedPeriod {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  reason: string;
  leaveTypeIds?: string[];
}

export interface AuditLog {
  _id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName?: string;
  timestamp: string;
  reason?: string;
  oldValue?: any;
  newValue?: any;
}

export interface LeaveValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  excessDays?: number;
  canConvertToUnpaid?: boolean;
  teamConflicts?: TeamConflict[];
}

export interface TeamConflict {
  employeeId: string;
  employeeName: string;
  leaveRequestId: string;
  startDate: string;
  endDate: string;
  overlapDays: number;
}

export interface IrregularLeavePattern {
  employeeId: string;
  employeeName: string;
  pattern: string;
  frequency: number;
  flaggedAt: string;
}

export interface OffboardingSettlement {
  employeeId: string;
  employeeName: string;
  remainingBalance: LeaveBalance[];
  encashmentDays: number;
  dailySalaryRate: number;
  encashmentAmount: number;
  isLocked: boolean;
}

// Query filters
export interface LeaveRequestFilters {
  employeeId?: string;
  managerId?: string;
  leaveTypeId?: string;
  status?: LeaveStatus;
  startDate?: string;
  endDate?: string;
  isEscalated?: boolean;
  flagged?: boolean;
}

export interface LeaveHistoryFilters {
  employeeId?: string;
  leaveTypeId?: string;
  status?: LeaveStatus;
  startDate?: string;
  endDate?: string;
}

