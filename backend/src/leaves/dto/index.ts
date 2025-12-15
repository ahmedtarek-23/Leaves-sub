import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsDate,
  IsMongoId,
  IsArray,
  ArrayMinSize,
  IsObject,
  ValidateNested,
  IsEmail,
} from 'class-validator';
import { AdjustmentType } from '../enums/adjustment-type.enum';
import { AccrualMethod } from '../enums/accrual-method.enum';
import { RoundingRule } from '../enums/rounding-rule.enum';
import { LeaveStatus } from '../enums/leave-status.enum';

/* =========================================================
   1. LEAVE TYPE
   ========================================================= */
export class CreateLeaveTypeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsMongoId()
  categoryId: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  paid?: boolean = true;

  @IsBoolean()
  @IsOptional()
  deductible?: boolean = true;

  @IsBoolean()
  @IsOptional()
  requiresAttachment?: boolean = false;

  @IsString()
  @IsOptional()
  attachmentType?: string;

  @IsNumber()
  @IsOptional()
  minTenureMonths?: number | null;

  @IsNumber()
  @IsOptional()
  maxDurationDays?: number | null;
}

export class UpdateLeaveTypeDto extends CreateLeaveTypeDto {}

/* =========================================================
   2. LEAVE POLICY
   ========================================================= */
export class CreatePolicyDto {
  @IsMongoId()
  leaveTypeId: string;

  @IsEnum(AccrualMethod)
  @IsOptional()
  accrualMethod?: AccrualMethod = AccrualMethod.MONTHLY;

  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyRate?: number = 0;

  @IsNumber()
  @Min(0)
  @IsOptional()
  yearlyRate?: number = 0;

  @IsBoolean()
  @IsOptional()
  carryForwardAllowed?: boolean = false;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxCarryForward?: number = 0;

  @IsNumber()
  @IsOptional()
  expiryAfterMonths?: number;

  @IsEnum(RoundingRule)
  @IsOptional()
  roundingRule?: RoundingRule = RoundingRule.NONE;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minNoticeDays?: number = 0;

  @IsNumber()
  @IsOptional()
  maxConsecutiveDays?: number;

  @IsObject()
  @IsOptional()
  eligibility?: Record<string, any>;
}

export class UpdatePolicyDto extends CreatePolicyDto {}

/* =========================================================
   3. ENTITLEMENT
   ========================================================= */
export class CreateEntitlementDto {
  @IsMongoId()
  employeeId: string;

  @IsMongoId()
  leaveTypeId: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  yearlyEntitlement?: number = 0;

  @IsNumber()
  @IsOptional()
  accruedActual?: number = 0;

  @IsNumber()
  @IsOptional()
  accruedRounded?: number = 0;

  @IsNumber()
  @Min(0)
  @IsOptional()
  carryForward?: number = 0;

  @IsNumber()
  @Min(0)
  @IsOptional()
  taken?: number = 0;

  @IsNumber()
  @Min(0)
  @IsOptional()
  pending?: number = 0;

  @IsNumber()
  @IsOptional()
  remaining?: number = 0;

  @IsDate()
  @IsOptional()
  lastAccrualDate?: Date;

  @IsDate()
  @IsOptional()
  nextResetDate?: Date;
}

/* =========================================================
   4. MANUAL ADJUSTMENT
   ========================================================= */
export class AdjustBalanceDto {
  @IsMongoId()
  leaveTypeId: string;

  @IsEnum(AdjustmentType)
  adjustmentType: AdjustmentType;

  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

/* =========================================================
   5. LEAVE REQUEST
   ========================================================= */
class DateRangeDto {
  @IsDate()
  @Type(() => Date)
  from: Date;

  @IsDate()
  @Type(() => Date)
  to: Date;
}

export class CreateLeaveRequestDto {
  @IsMongoId()
  leaveTypeId: string;

  @IsObject()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dates: DateRangeDto;

  @IsString()
  @IsOptional()
  justification?: string;

  @IsMongoId()
  @IsOptional()
  attachmentId?: string;
}

export class UpdateLeaveRequestDto extends CreateLeaveRequestDto {}

/* =========================================================
   6. APPROVAL / REJECTION
   ========================================================= */
export class ApproveRejectDto {
  @IsEnum(['APPROVE', 'REJECT'])
  action: 'APPROVE' | 'REJECT';

  @IsString()
  @IsOptional()
  reason?: string;
}

/* =========================================================
   7. HR FINALIZE / OVERRIDE
   ========================================================= */
export class HrFinalizeDto {
  @IsBoolean()
  override: boolean = false;

  @IsEnum(LeaveStatus)
  @IsOptional()
  finalStatus?: LeaveStatus;

  @IsString()
  @IsOptional()
  comments?: string;
}

/* =========================================================
   8. BULK APPROVE
   ========================================================= */
export class BulkApproveDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  ids: string[];
}

/* =========================================================
   9. CALENDAR
   ========================================================= */
export class CreateCalendarDto {
  @IsNumber()
  year: number;

  @IsArray()
  @IsDate({ each: true })
  @Type(() => Date)
  holidays: Date[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlockedPeriodDto)
  blockedPeriods: BlockedPeriodDto[];
}

class BlockedPeriodDto {
  @IsDate()
  @Type(() => Date)
  from: Date;

  @IsDate()
  @Type(() => Date)
  to: Date;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

/* =========================================================
   10. FILTERS (used in queries)
   ========================================================= */
export class ListRequestsFilterDto {
  @IsEnum(LeaveStatus)
  @IsOptional()
  status?: LeaveStatus;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  from?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  to?: Date;
}