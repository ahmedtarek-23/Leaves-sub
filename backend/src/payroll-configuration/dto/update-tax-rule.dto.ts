// backend/src/payroll-configuration/dto/update-tax-rule.dto.ts
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateTaxRuleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  rate?: number;
}