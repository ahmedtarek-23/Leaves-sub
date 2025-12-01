// backend/src/payroll-configuration/dto/update-allowance.dto.ts
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateAllowanceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;
}