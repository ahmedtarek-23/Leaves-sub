// backend/src/payroll-configuration/dto/create-insurance.dto.ts
import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class CreateInsuranceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  minSalary: number;

  @IsNumber()
  @Min(0)
  maxSalary: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  employeeRate: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  employerRate: number;
}