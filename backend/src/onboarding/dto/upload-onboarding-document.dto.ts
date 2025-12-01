export class UploadOnboardingDocumentDto {
  candidateId!: string;
  onboardingId?: string;
  documentType!: string;
  fileUrl!: string;
  storageReference?: string;
  uploadedAt?: Date;
  notes?: string;

  // TODO[SCHEMA]: ONB-007 requires detailed document metadata (type, uploadedAt, notes),
  // but current Document/Onboarding schemas may not expose all of these fields. Using API-level
  // DTO to capture intent without altering schemas per instructions.
}