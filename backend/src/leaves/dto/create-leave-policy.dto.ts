import {
  IsMongoId,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { AccrualMethod } from '../enums/accrual-method.enum';
import { RoundingRule } from '../enums/rounding-rule.enum';

export class CreateLeavePolicyDto {
  @IsMongoId()
  leaveTypeId: string;

  @IsEnum(AccrualMethod)
  accrualMethod: AccrualMethod;

  @IsNumber()
  monthlyRate: number;

  @IsNumber()
  yearlyRate: number;

  @IsOptional()
  @IsNumber()
  maxCarryForward?: number;

  @IsOptional()
  @IsEnum(RoundingRule)
  roundingRule?: RoundingRule;

  @IsOptional()
  @IsNumber()
  minNoticeDays?: number;

  @IsOptional()
  @Min(1)
  @IsNumber()
  maxConsecutiveDays?: number;
}
