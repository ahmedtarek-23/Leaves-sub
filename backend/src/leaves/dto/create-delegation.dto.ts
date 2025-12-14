import {
  IsNotEmpty,
  IsDate,
  IsString,
  IsOptional,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDelegationDto {
  @IsNotEmpty()
  @IsMongoId()
  delegateeId: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsOptional()
  @IsString()
  reason?: string;
}
