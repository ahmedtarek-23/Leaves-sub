import { IsString, IsNotEmpty, IsOptional, IsEnum, IsMongoId } from 'class-validator';
import { DisputeStatus } from '../enums/payroll-tracking-enum';

export class CreateDisputeDto {
  @IsString()
  @IsNotEmpty()
  disputeId: string; // DISP-0001

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsMongoId()
  @IsNotEmpty()
  employeeId: string;

  @IsMongoId()
  @IsOptional()
  financeStaffId?: string;

  @IsMongoId()
  @IsNotEmpty()
  payslipId: string;

  @IsEnum(DisputeStatus)
  @IsOptional()
  status?: DisputeStatus;

  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @IsString()
  @IsOptional()
  resolutionComment?: string;
}