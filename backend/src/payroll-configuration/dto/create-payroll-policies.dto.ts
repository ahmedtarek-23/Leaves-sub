import { IsString, IsNotEmpty, IsEnum, IsDate, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PolicyType, Applicability } from '../enums/payroll-configuration-enums';

// DTO that models the mandatory nested RuleDefinition class from payrollPolicies.schema.ts
class RuleDefinitionDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsNotEmpty()
  percentage: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  fixedAmount: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  thresholdAmount: number;
}

export class CreatePayrollPoliciesDto {
  @IsString()
  @IsNotEmpty()
  policyName: string;

  @IsEnum(PolicyType)
  @IsNotEmpty()
  policyType: PolicyType;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  effectiveDate: Date;

  @ValidateNested()
  @Type(() => RuleDefinitionDto)
  @IsNotEmpty()
  ruleDefinition: RuleDefinitionDto; // Must be present

  @IsEnum(Applicability)
  @IsNotEmpty()
  applicability: Applicability;
}