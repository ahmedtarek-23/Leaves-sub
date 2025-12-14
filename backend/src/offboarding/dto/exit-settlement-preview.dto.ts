// OFF-013, BR-9, BR-11 – preview of exit settlement inputs before notifying Payroll.
export class ExitSettlementPreviewDto {
  employeeId!: string;
  terminationEffectiveDate!: Date;
  noticeEndDate?: Date;
  remainingLeaveDays?: number;
  estimatedLeaveEncashmentAmount?: number;
  benefitsToTerminate?: { benefitName: string; terminationDate: Date }[];
  // TODO[SCHEMA]: OFF-013 would benefit from explicit fields for leave balances and benefits metadata.
}