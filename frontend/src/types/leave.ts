export type LeaveBalance = {
  leaveTypeCode: string;
  leaveTypeName: string;
  accrued: number;
  used: number;
  remaining: number;
  pending: number;
  carryOver?: number;
};

export type AccrualRecord = {
  id: string;
  date: string;
  leaveTypeCode: string;
  leaveTypeName: string;
  amount: number;
  reason?: string;
  adjustmentType?: 'automatic' | 'manual';
  adjustedBy?: string;
};

export type YearEndResult = {
  fiscalYear: number;
  carriedForward: number;
  expired: number;
  encashmentAmount?: number;
  encashmentDays?: number;
  dailySalaryRate?: number;
  notes?: string;
};

// Legacy type for backward compatibility
export type YearEndSummary = YearEndResult;
