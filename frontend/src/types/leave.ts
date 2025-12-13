export type LeaveBalance = {
  leaveTypeCode: string;
  leaveTypeName: string;
  accrued: number;
  taken: number;
  remaining: number;
};

export type AccrualRecord = {
  date: string;
  leaveTypeCode: string;
  leaveTypeName: string;
  amount: number;
  reason?: string;
};

export type YearEndSummary = {
  fiscalYear: number;
  carriedForward: number;
  expired: number;
  notes?: string;
};
