import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PositionAnalyticsDto } from './position-analytics.dto';

export class RecruitmentOverviewAnalyticsDto {
  @IsNumber()
  totalOpenRequisitions: number;

  @IsNumber()
  totalApplications: number;

  @IsNumber()
  totalInterviewsScheduled: number;

  @IsNumber()
  totalOffersMade: number;

  @IsNumber()
  totalHires: number;

  @IsOptional()
  @IsNumber()
  averageTimeToHireDays?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PositionAnalyticsDto)
  positions: PositionAnalyticsDto[];
}