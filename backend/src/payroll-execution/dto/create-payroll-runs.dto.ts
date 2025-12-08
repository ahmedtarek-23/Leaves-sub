import { IsDate, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PayRollStatus, PayRollPaymentStatus } from '../enums/payroll-execution-enum';

export class CreatePayrollRunsDto {
@IsString()
runId: string; // e.g., PR-2025-0001

@IsDate()
payrollPeriod: Date; // end of the month

@IsEnum(PayRollStatus)
status: PayRollStatus;

@IsString()
entity: string; // company name

@IsNumber()
@Min(0)
employees: number;

@IsNumber()
@Min(0)
exceptions: number;

@IsNumber()
@Min(0)
totalnetpay: number;

@IsMongoId()
payrollSpecialistId: string;

@IsEnum(PayRollPaymentStatus)
paymentStatus: PayRollPaymentStatus;

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
