import { IsArray, IsMongoId, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CriteriaScoreDto {
  @IsString()
  criteriaKey: string;

  @IsNumber()
  score: number;
}

export class SubmitInterviewFeedbackDto {
  @IsMongoId()
  interviewId: string;

  @IsMongoId()
  submittedBy: string;

  @IsNumber()
  @IsOptional()
  overallRating?: number;

  @IsString()
  @IsOptional()
  comments?: string;

  // TODO[SCHEMA]: REC-020 / BR-21 / BR-23 suggest structured criteria scoring, but
  // AssessmentResult schema only supports score/comments. Capturing requested shape
  // for validation while persisting only supported fields.
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriteriaScoreDto)
  @IsOptional()
  criteriaScores?: CriteriaScoreDto[];
}

export class AssessmentFormConfigDto {
  // TODO[SCHEMA]: Configurable assessment criteria/tools are not modeled.
  // Returning placeholder structure for UI consumption.
  criteria: { key: string; label: string }[];
}