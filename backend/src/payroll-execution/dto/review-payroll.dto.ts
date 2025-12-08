import { IsBoolean, IsString, IsOptional, ValidateIf, IsNotEmpty } from 'class-validator';

export class ReviewPayrollDto {
  @IsBoolean()
  approved: boolean;

  @IsString()
  @IsOptional()
  // If approved is false, reason becomes required
  @ValidateIf((o) => o.approved === false)
  @IsNotEmpty({ message: 'Reason is required when rejecting a payroll cycle' })
  reason?: string;
}