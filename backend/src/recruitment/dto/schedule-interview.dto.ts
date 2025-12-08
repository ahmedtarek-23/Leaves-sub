import {
  IsArray,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApplicationStage } from '../enums/application-stage.enum';
import { InterviewMethod } from '../enums/interview-method.enum';

export class ScheduleInterviewDto {
  @IsMongoId()
  applicationId: string;

  @IsEnum(ApplicationStage)
  stage: ApplicationStage;

  @IsDateString()
  scheduledDate: Date;

  @IsEnum(InterviewMethod)
  method: InterviewMethod;

  @IsArray()
  @IsOptional()
  panelMemberIds?: string[];

  @IsString()
  @IsOptional()
  calendarEventId?: string;

  @IsString()
  @IsOptional()
  videoLink?: string;
}