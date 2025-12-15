import { IsDateString, IsOptional, IsString } from 'class-validator';

export class RescheduleInterviewDto {
  @IsDateString()
  scheduledDate: Date;

  // TODO[SCHEMA]: If reschedule reasons/notes should be stored, current Interview schema
  // does not expose a dedicated field. Using existing fields only.
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  calendarEventId?: string;
}