import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class ClockOutDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsOptional()
  @IsDateString()
  timestamp?: string;
}
