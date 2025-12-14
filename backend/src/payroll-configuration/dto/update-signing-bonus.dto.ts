// backend/src/payroll-configuration/dto/update-signing-bonus.dto.ts
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateSigningBonusDto {
  @IsString()
  @IsOptional()
  positionName?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;
}