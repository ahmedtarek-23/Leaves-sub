import {
  IsOptional,
  IsDate,
  IsNumber,
  IsString,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateLeaveRequestDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsNumber()
  durationDays?: number;

  @IsOptional()
  @IsString()
  justification?: string;

  @IsOptional()
  @IsMongoId()
  leaveTypeId?: string;
}
