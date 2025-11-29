import { IsOptional, IsDateString, IsNumber, IsString } from 'class-validator';

export class ModifyLeaveRequestDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsNumber()
  durationDays?: number;

  @IsOptional()
  @IsString()
  justification?: string;
}
