// backend/src/payroll-configuration/dto/update-insurance.dto.ts
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UpdateInsuranceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minSalary?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxSalary?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  employeeRate?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  employerRate?: number;
}
