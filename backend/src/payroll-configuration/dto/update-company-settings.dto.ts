// backend/src/payroll-configuration/dto/update-company-settings.dto.ts
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateCompanySettingsDto {
  @IsDateString()
  @IsOptional()
  payDate?: Date;

  @IsString()
  @IsOptional()
  timeZone?: string;

  @IsString()
  @IsOptional()
  currency?: string;
}