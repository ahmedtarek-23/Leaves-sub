// backend/src/payroll-configuration/dto/change-status.dto.ts
import { IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ConfigStatus } from '../enums/payroll-configuration-enums';

export class ChangeStatusDto {
  @IsEnum(ConfigStatus)
  @IsNotEmpty()
  status: ConfigStatus;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}