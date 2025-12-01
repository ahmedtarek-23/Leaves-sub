export class CreateLeavePolicyDto {
  leaveTypeId: string;
  payrollPayCode: string;
  accrualMethod?: string;
  monthlyRate?: number;
  yearlyRate?: number;
  roundingRule?: 'NO_ROUNDING' | 'HALF_DAY' | 'FULL_DAY';
  isActive?: boolean;
}
