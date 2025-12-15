import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDate,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ResetType } from '../models/reset-policy.schema';

export class CreateResetPolicyDto {
  @IsNotEmpty()
  @IsMongoId()
  organizationId: string;

  @IsNotEmpty()
  @IsMongoId()
  leaveTypeId: string;

  @IsNotEmpty()
  @IsEnum(ResetType)
  resetType: ResetType;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  customResetDate?: Date;
}
