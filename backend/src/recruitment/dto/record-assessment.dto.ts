import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class RecordAssessmentDto {
  @IsMongoId()
  interviewId: string;

  @IsMongoId()
  interviewerId: string;

  @IsNumber()
  score: number;

  @IsString()
  @IsOptional()
  comments?: string;
}