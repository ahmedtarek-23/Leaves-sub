import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class ClockInDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsOptional()
  @IsDateString()
  timestamp?: string;
}
