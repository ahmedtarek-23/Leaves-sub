import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class InitiatePayrollDto {
  @IsString()
  @IsNotEmpty()
  // Validates format like "2025-11"
  @Matches(/^\d{4}-\d{2}$/, { message: 'Period must be in YYYY-MM format' })
  period: string;
}