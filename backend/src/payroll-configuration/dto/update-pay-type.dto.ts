// backend/src/payroll-configuration/dto/update-pay-type.dto.ts
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdatePayTypeDto {
  @IsString()
  @IsOptional()
  type?: string;

  @IsNumber()
  @Min(6000)
  @IsOptional()
  amount?: number;
}