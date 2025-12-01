import { IsArray, IsDate, IsMongoId, IsNumber, IsOptional, IsEnum, ValidateNested, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaySlipPaymentStatus } from '../enums/payroll-execution-enum';


class AllowanceDto {
  @IsMongoId()
  id: string; // reference to allowance

  @IsNumber()
  @Min(0)
  amount: number;
}

class BonusDto {
  @IsMongoId()
  id: string; // reference to signingBonus

  @IsNumber()
  @Min(0)
  amount: number;
}

class BenefitDto {
  @IsMongoId()
  id: string; // reference to terminationAndResignationBenefits

  @IsNumber()
  @Min(0)
  amount: number;
}

class RefundDto {
  @IsMongoId()
  id: string; // reference to refunds

  @IsNumber()
  @Min(0)
  amount: number;
}

export class EarningsDto {
  @IsNumber()
  baseSalary: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllowanceDto)
  allowances?: AllowanceDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BonusDto)
  bonuses?: BonusDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BenefitDto)
  benefits?: BenefitDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RefundDto)
  refunds?: RefundDto[];
}

class TaxDto {
  @IsMongoId()
  id: string; // reference to taxRules

  @IsNumber()
  @Min(0)
  rate: number;
}

class InsuranceDto {
  @IsMongoId()
  id: string; // reference to insuranceBrackets

  @IsNumber()
  @Min(0)
  employeeRate: number;

  @IsNumber()
  @Min(0)
  employerRate: number;
}

class PenaltyDto {
  @IsString()
  reason: string;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class DeductionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxDto)
  taxes: TaxDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InsuranceDto)
  insurances?: InsuranceDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PenaltyDto)
  penalties?: PenaltyDto;
}

// --- Main DTO ---
export class CreatePayslipDto {
  @IsMongoId()
  employeeId: string;

  @IsMongoId()
  payrollRunId: string;

  @ValidateNested()
  @Type(() => EarningsDto)
  earningsDetails: EarningsDto;

  @ValidateNested()
  @Type(() => DeductionsDto)
  deductionsDetails: DeductionsDto;

  @IsNumber()
  totalGrossSalary: number;

  @IsOptional()
  @IsNumber()
  totaDeductions?: number;

  @IsNumber()
  netPay: number;

  @IsOptional()
  @IsEnum(PaySlipPaymentStatus)
  paymentStatus?: PaySlipPaymentStatus;
}
