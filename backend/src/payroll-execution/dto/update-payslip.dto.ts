import { IsOptional, IsNumber, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaySlipPaymentStatus } from '../enums/payroll-execution-enum';
import { EarningsDto, DeductionsDto } from './create-payslip.dto';

export class UpdatePayslipDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => EarningsDto)
  earningsDetails?: EarningsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DeductionsDto)
  deductionsDetails?: DeductionsDto;

  @IsOptional()
  @IsNumber()
  totalGrossSalary?: number;

  @IsOptional()
  @IsNumber()
  totaDeductions?: number;

  @IsOptional()
  @IsNumber()
  netPay?: number;

  @IsOptional()
  @IsEnum(PaySlipPaymentStatus)
  paymentStatus?: PaySlipPaymentStatus;
}
