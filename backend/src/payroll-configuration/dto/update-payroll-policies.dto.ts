import { IsString, IsOptional, IsEnum, IsDateString, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PolicyType, Applicability } from '../enums/payroll-configuration-enums';

// DTO that models the optional nested RuleDefinition update
class UpdateRuleDefinitionDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  percentage?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  fixedAmount?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  thresholdAmount?: number;
}

export class UpdatePayrollPoliciesDto {
  @IsString()
  @IsOptional()
  policyName?: string;

  @IsEnum(PolicyType)
  @IsOptional()
  policyType?: PolicyType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  effectiveDate?: Date;

  @ValidateNested()
  @Type(() => UpdateRuleDefinitionDto)
  @IsOptional()
  ruleDefinition?: UpdateRuleDefinitionDto;

  @IsEnum(Applicability)
  @IsOptional()
  applicability?: Applicability;
}