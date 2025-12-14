// OFF-013 – payload sent to Payroll for final settlement and benefits termination.
export class ExitSettlementNotificationDto {
  employeeId!: string;
  terminationEffectiveDate!: Date;
  noticeEndDate?: Date;
  remainingLeaveDays?: number;
  benefitsPlanIds?: string[];
  remarks?: string;
  // TODO[INTEGRATION]: Provide encashment/deduction details via Payroll module.
}