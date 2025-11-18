import { IsString, IsNumber, IsBoolean, IsArray } from 'class-validator';

class PayComponentDto {
  @IsString()
  componentName: string;

  @IsString()
  type: 'Earning' | 'Deduction' | 'Statutory';

  @IsNumber()
  amount: number;

  @IsString()
  source?: string;
}

export class EmployeePayRecordDto {
  @IsString()
  employeeId: string;

  @IsNumber()
  grossSalary: number;

  @IsNumber()
  finalPaidSalary: number;

  @IsArray()
  payComponentBreakdown: PayComponentDto[];

  @IsBoolean()
  hasAnomaly: boolean;

  @IsArray()
  @IsString({ each: true })
  exceptions: string[];
}
