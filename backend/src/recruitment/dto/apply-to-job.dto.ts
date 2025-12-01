import { IsBoolean, IsMongoId, IsOptional } from 'class-validator';

export class ApplyToJobDto {
  @IsMongoId()
  candidateId: string;

  @IsMongoId()
  requisitionId: string;

  @IsMongoId()
  @IsOptional()
  assignedHr?: string;

  // TODO[SCHEMA]: BR-12 expects storing a resume/CV reference per application, but the Application
  // schema currently has no dedicated resume field. This DTO captures the document id for future
  // integration without persisting it until schema support exists.
  @IsMongoId()
  @IsOptional()
  resumeDocumentId?: string;

  // Requirement: REC-028, BR-28, NFR-33 – candidates must provide explicit consent before storing
  // their data in the talent pool. This flag is required for apply-to-job submissions to enforce
  // consent at the point of data collection.
  @IsBoolean()
  consentToDataProcessing: boolean;

  @IsBoolean()
  @IsOptional()
  consentToBackgroundChecks?: boolean;
}