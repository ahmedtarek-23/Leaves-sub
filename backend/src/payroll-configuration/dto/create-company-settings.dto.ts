// backend/src/payroll-configuration/dto/create-company-settings.dto.ts
import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class CreateCompanySettingsDto {
  @IsDateString()
  @IsNotEmpty()
  payDate: Date;

  @IsString()
  @IsNotEmpty()
  timeZone: string;

  @IsString()
  @IsOptional()
  currency?: string; // Default is 'EGP' per schema
}