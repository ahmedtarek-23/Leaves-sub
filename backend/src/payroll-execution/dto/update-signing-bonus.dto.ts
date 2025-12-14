import { IsMongoId, IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ConfigStatus } from '../../payroll-configuration/enums/payroll-configuration-enums';


export class UpdateSigningBonusDto {
  @IsOptional()
  @IsString()
  positionName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsEnum(ConfigStatus)
  status?: ConfigStatus;

  @IsOptional()
  @IsMongoId()
  createdBy?: string;

  @IsOptional()
  @IsMongoId()
  approvedBy?: string;

  @IsOptional()
  approvalDate?: Date;
}
