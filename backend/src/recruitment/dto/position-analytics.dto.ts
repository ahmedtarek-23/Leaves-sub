import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class StageCountDto {
  @IsString()
  stage: string;

  @IsNumber()
  count: number;
}

class SourceCountDto {
  @IsString()
  source: string;

  @IsNumber()
  count: number;
}

export class PositionAnalyticsDto {
  @IsString()
  requisitionId: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsNumber()
  totalApplications: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StageCountDto)
  applicationsByStage: StageCountDto[];

  @IsNumber()
  totalInterviewsScheduled: number;

  @IsNumber()
  totalInterviewsCompleted: number;

  @IsNumber()
  totalOffersMade: number;

  @IsNumber()
  totalOffersAccepted: number;

  @IsNumber()
  totalOffersRejected: number;

  @IsOptional()
  @IsNumber()
  averageTimeToHireDays?: number;

  @IsNumber()
  totalHires: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SourceCountDto)
  sources?: SourceCountDto[];
}