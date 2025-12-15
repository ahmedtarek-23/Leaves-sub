import { IsString, IsNotEmpty, IsOptional, IsEnum, IsMongoId, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { RefundStatus } from '../enums/payroll-tracking-enum';

class RefundDetailsDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  amount: number;
}

export class CreateRefundDto {
  @IsMongoId()
  @IsOptional()
  claimId?: string;

  @IsMongoId()
  @IsOptional()
  disputeId?: string;

  @ValidateNested()
  @Type(() => RefundDetailsDto)
  refundDetails: RefundDetailsDto;

  @IsMongoId()
  @IsNotEmpty()
  employeeId: string;

  @IsMongoId()
  @IsOptional()
  financeStaffId?: string;

  @IsEnum(RefundStatus)
  @IsOptional()
  status?: RefundStatus;

  @IsMongoId()
  @IsOptional()
  paidInPayrollRunId?: string;
}