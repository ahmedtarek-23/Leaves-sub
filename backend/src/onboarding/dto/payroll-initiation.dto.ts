export class PayrollInitiationDto {
  onboardingId: string;
  candidateId: string;
  employeeProfileId?: string;
  contractSigningDate: Date;
  effectiveStartDate?: Date;
  payrollCycle?: string;
  // ONB-018, BR-9(a), REQ-PY-23 – Data needed to initiate payroll for new hire.
}