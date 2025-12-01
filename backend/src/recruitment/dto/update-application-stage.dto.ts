import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApplicationStage } from '../enums/application-stage.enum';

export class UpdateApplicationStageDto {
  // TODO[INTEGRATION]: Requirement stages (Screening, Shortlisting, Interview, Offer, Hired)
  // mapped to existing ApplicationStage enum values; enum currently defines
  // screening, department_interview, hr_interview, and offer.
  @IsEnum(ApplicationStage)
  stage: ApplicationStage;

  @IsString()
  changedBy: string;

  // TODO[SCHEMA]: Requirement allows notes on stage change, but history schema
  // does not define a notes field. Ignoring notes per current schema.
  @IsOptional()
  @IsString()
  notes?: string;
}