// backend/src/payroll-configuration/dto/create-allowance.dto.ts
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateAllowanceDto {
  @IsString()
  @IsNotEmpty()
  name: string; // allowance name like: Housing Allowance, Transport Allowance

  @IsNumber()
  @Min(0)
  amount: number;
}