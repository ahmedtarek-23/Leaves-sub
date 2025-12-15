export class SigningBonusTriggerDto {
  onboardingId: string;
  candidateId: string;
  employeeProfileId?: string;
  contractId?: string;
  signingBonusAmount?: number;
  currency?: string;
  // ONB-019, BR-9(a), REQ-PY-27 – Data needed to trigger signing bonus in Payroll.
}