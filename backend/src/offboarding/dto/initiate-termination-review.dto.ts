import { IsDateString, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TerminationInitiation } from '../../recruitment/enums/termination-initiation.enum';

// OFF-001, BR-4 – captures effective date + clearly stated reason and optional performance linkage.
export class InitiateTerminationReviewDto {
  @IsMongoId()
  employeeId: string;

  @IsMongoId()
  requestedById: string;

  @IsDateString()
  effectiveDate: Date;

  @IsString()
  @IsOptional()
  reasonCode?: string;

  @IsString()
  @IsNotEmpty()
  reasonDescription: string;

  @IsString()
  @IsOptional()
  performanceRecordId?: string;

  @IsMongoId()
  contractId: string;

  @IsEnum(TerminationInitiation)
  @IsOptional()
  initiator?: TerminationInitiation;
}