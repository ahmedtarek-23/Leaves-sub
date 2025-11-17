import { IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';

export class InterviewFeedbackDto {
  @IsNumber()
  @IsOptional()
  overallScore?: number;

  @IsString()
  @IsOptional()
  feedback?: string;

  @IsEnum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
  status: string;
}