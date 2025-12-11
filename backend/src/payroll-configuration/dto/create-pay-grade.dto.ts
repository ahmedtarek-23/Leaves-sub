// backend/src/payroll-configuration/dto/create-pay-grade.dto.ts
import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsMongoId } from 'class-validator';

export class CreatePayGradeDto {
  @IsString()
  @IsNotEmpty()
  grade: string;

  @IsNumber()
  @Min(6000)
  baseSalary: number;

  @IsNumber()
  @Min(6000)
  grossSalary: number;

  @IsMongoId()
  @IsOptional()
  departmentId?: string;

  @IsMongoId()
  @IsOptional()
  positionId?: string;
}