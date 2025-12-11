import { IsMongoId, IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ConfigStatus } from '../../payroll-configuration/enums/payroll-configuration-enums';


export class CreateSigningBonusDto {
  @IsString()
  positionName: string; // like: Junior TA, Mid TA

  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(ConfigStatus)
  status: ConfigStatus; // draft, approved, rejected

  @IsOptional()
  @IsMongoId()
  createdBy?: string;

  @IsOptional()
  @IsMongoId()
  approvedBy?: string;

  @IsOptional()
  approvalDate?: Date;
}
