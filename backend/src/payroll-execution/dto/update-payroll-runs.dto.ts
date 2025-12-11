import { IsDate, IsEnum, IsMongoId, IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { PayRollStatus, PayRollPaymentStatus } from '../enums/payroll-execution-enum';

export class UpdatePayrollRunsDto {
@IsOptional()
@IsEnum(PayRollStatus)
status?: PayRollStatus;

@IsOptional()
@IsNumber()
@Min(0)
employees?: number;

@IsOptional()
@IsNumber()
@Min(0)
exceptions?: number;

@IsOptional()
@IsNumber()
@Min(0)
totalnetpay?: number;

@IsOptional()
@IsEnum(PayRollPaymentStatus)
paymentStatus?: PayRollPaymentStatus;

@IsOptional()
@IsMongoId()
payrollManagerId?: string;

@IsOptional()
@IsMongoId()
financeStaffId?: string;

@IsOptional()
@IsString()
rejectionReason?: string;

@IsOptional()
@IsString()
unlockReason?: string;

@IsOptional()
@IsDate()
managerApprovalDate?: Date;

@IsOptional()
@IsDate()
financeApprovalDate?: Date;
}
