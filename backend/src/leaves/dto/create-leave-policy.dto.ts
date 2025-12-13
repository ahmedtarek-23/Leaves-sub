import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional, IsEnum, IsObject } from 'class-validator';
import { AccrualMethod } from '../enums/accrual-method.enum';
import { RoundingRule } from '../enums/rounding-rule.enum';

export class CreateLeavePolicyDto {
    @IsString()
    @IsNotEmpty()
    leaveTypeId: string;

    @IsEnum(AccrualMethod)
    @IsOptional()
    accrualMethod?: AccrualMethod;

    @IsNumber()
    @IsOptional()
    monthlyRate?: number;

    @IsNumber()
    @IsOptional()
    yearlyRate?: number;

    @IsBoolean()
    @IsOptional()
    carryForwardAllowed?: boolean;

    @IsNumber()
    @IsOptional()
    maxCarryForward?: number;

    @IsNumber()
    @IsOptional()
    expiryAfterMonths?: number;

    @IsEnum(RoundingRule)
    @IsOptional()
    roundingRule?: RoundingRule;

    @IsNumber()
    @IsOptional()
    minNoticeDays?: number;

    @IsNumber()
    @IsOptional()
    maxConsecutiveDays?: number;

    @IsObject()
    @IsOptional()
    eligibility?: Record<string, any>;

    @IsNumber()
    @IsOptional()
    sickCycleMaxDays?: number;

    @IsString()
    @IsNotEmpty()
    payrollPayCode: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
