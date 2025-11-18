import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class ExternalPayrollInputsDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsNumber()
  @IsOptional()
  performanceBonus?: number; // From Team 4

  @IsNumber()
  @IsOptional()
  signingBonus?: number; // From Team 5

  @IsNumber()
  @IsOptional()
  unpaidLeaveDays?: number; // From Team 2
}
