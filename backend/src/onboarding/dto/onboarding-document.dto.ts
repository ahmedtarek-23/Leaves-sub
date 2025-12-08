export class OnboardingDocumentDto {
  id!: string;
  documentType!: string;
  fileUrl!: string;
  uploadedAt?: Date;
  verified?: boolean;
  notes?: string;

  // TODO[SCHEMA]: ONB-007 requires tracking verification metadata and document notes per BR-7,
  // but current Document/Onboarding schemas do not expose explicit verification fields.
}