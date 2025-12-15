import { IsBoolean, IsDate, IsMongoId, IsOptional } from 'class-validator';

export class CandidateConsentDto {
  @IsMongoId()
  candidateId: string;

  // Requirement: REC-028, BR-28, NFR-33 – explicit consent for data processing is mandatory prior
  // to storing candidates in the talent pool.
  @IsBoolean()
  consentToDataProcessing: boolean;

  @IsBoolean()
  @IsOptional()
  consentToBackgroundChecks?: boolean;

  // TODO[SCHEMA]: REC-028 / BR-28 / NFR-33 call for storing consent timestamps, but current Candidate
  // schema does not include consent audit fields. This optional API field is accepted for future
  // persistence once schema support exists.
  @IsOptional()
  @IsDate()
  timestamp?: Date;
}