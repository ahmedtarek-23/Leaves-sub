// backend/src/payroll-configuration/dto/update-pay-grade.dto.ts
import { IsString, IsOptional, IsNumber, Min, IsMongoId } from 'class-validator';

export class UpdatePayGradeDto {
  @IsString()
  @IsOptional()
  grade?: string;

  @IsNumber()
  @Min(6000)
  @IsOptional()
  baseSalary?: number;

  @IsNumber()
  @Min(6000)
  @IsOptional()
  grossSalary?: number;

  @IsMongoId()
  @IsOptional()
  departmentId?: string;

  @IsMongoId()
  @IsOptional()
  positionId?: string;
}