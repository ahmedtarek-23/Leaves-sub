// backend/src/payroll-configuration/dto/create-pay-type.dto.ts
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreatePayTypeDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  @Min(6000)
  amount: number;
}