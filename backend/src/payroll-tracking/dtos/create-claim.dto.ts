import { IsString, IsNotEmpty, IsOptional, IsEnum, IsMongoId, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ClaimStatus } from '../enums/payroll-tracking-enum';

export class CreateClaimDto {
  @IsString()
  @IsNotEmpty()
  claimId: string; // e.g. "CLAIM-0001" (frontend or service can generate)

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  claimType: string; // e.g. "medical"

  @IsMongoId()
  @IsNotEmpty()
  employeeId: string; // ObjectId as string

  @IsMongoId()
  @IsOptional()
  financeStaffId?: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  amount: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  approvedAmount?: number;

  @IsEnum(ClaimStatus)
  @IsOptional()
  status?: ClaimStatus; // default is UNDER_REVIEW if not provided

  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @IsString()
  @IsOptional()
  resolutionComment?: string;
}