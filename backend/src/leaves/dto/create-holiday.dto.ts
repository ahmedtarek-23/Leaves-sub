import { IsDate, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHolidayDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  year: number;
}
