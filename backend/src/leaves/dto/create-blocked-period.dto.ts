import { IsDate, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBlockedPeriodDto {
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  from: Date;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  to: Date;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsNotEmpty()
  year: number;
}
