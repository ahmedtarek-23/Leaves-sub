// OFF-007 – payload for revoking system and account access.
export class AccessRevocationDto {
  employeeId!: string;
  terminationEffectiveDate!: Date;
  reasons?: string;
}