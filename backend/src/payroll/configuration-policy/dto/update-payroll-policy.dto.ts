import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// Correct imports using the validated alias @shared-types/
import {
  ITaxRule,
  IInsuranceBracket,
  IPenaltyRule,
} from '../../../shared/types/payroll/payroll-utils.interface';

// Helper DTOs for nested updates (using the interfaces directly)
class TaxRuleDto implements ITaxRule {
  @IsString()
  taxRuleId: string;
  @IsString()
  countryCode: string;
  @IsNumber()
  minIncome: number;
  maxIncome: number | 'INF'; // Handled via runtime validation if required
  @IsNumber()
  taxRate: number;
  effectiveDate: Date;
}

class InsuranceBracketDto implements IInsuranceBracket {
  @IsString()
  bracketId: string;
  @IsNumber()
  minSalary: number;
  @IsNumber()
  maxSalary: number;
  @IsNumber()
  employeeRate: number;
  @IsNumber()
  companyRate: number;
}

class PenaltyRuleDto implements IPenaltyRule {
  @IsString()
  penaltyCode: string;
  @IsString()
  name: string;
  @IsEnum(['FIXED_AMOUNT', 'PERCENTAGE_OF_BASE', 'UNPAID_DAY_RATE'])
  type: 'FIXED_AMOUNT' | 'PERCENTAGE_OF_BASE' | 'UNPAID_DAY_RATE';
  @IsNumber()
  value: number;
  @IsEnum(['Lateness', 'Misconduct', 'Absenteeism'])
  appliesTo: 'Lateness' | 'Misconduct' | 'Absenteeism';
}

/**
 * DTO for updating the IConfigPolicy. All fields are optional since it's a PATCH/PUT operation.
 */
export class UpdatePayrollPolicyDto {
  @IsOptional()
  @IsString()
  policyCode?: string;

  @IsOptional()
  @IsEnum(['MONTHLY', 'WEEKLY', 'BI_WEEKLY'])
  payFrequency?: 'MONTHLY' | 'WEEKLY' | 'BI_WEEKLY';

  @IsOptional()
  @IsNumber()
  payDate?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxRuleDto)
  taxRules?: TaxRuleDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InsuranceBracketDto)
  insuranceBrackets?: InsuranceBracketDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PenaltyRuleDto)
  misconductPenalties?: PenaltyRuleDto[];

  // Note: Status changes and approval fields are typically handled internally by the Service, not via DTO input.
}
