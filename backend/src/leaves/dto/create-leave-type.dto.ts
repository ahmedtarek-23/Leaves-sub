import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsMongoId,
} from 'class-validator';

export class CreateLeaveTypeDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsMongoId()
  categoryId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  paid?: boolean;

  @IsOptional()
  @IsBoolean()
  deductible?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresAttachment?: boolean;

  @IsOptional()
  @IsNumber()
  minTenureMonths?: number;

  @IsOptional()
  @IsNumber()
  maxDurationDays?: number;
}
