// backend/src/payroll-configuration/dto/create-signing-bonus.dto.ts
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateSigningBonusDto {
  @IsString()
  @IsNotEmpty()
  positionName: string;

  @IsNumber()
  @Min(0)
  amount: number;
}