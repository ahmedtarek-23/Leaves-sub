import { IsMongoId, IsNumber, IsEnum, IsOptional } from "class-validator";
import { BankStatus } from "../enums/payroll-execution-enum";

export class UpdateEmployeePayrollDetailsDto {
  @IsOptional()
  @IsNumber()
  baseSalary?: number;

  @IsOptional()
  @IsNumber()
  allowances?: number;

  @IsOptional()
  @IsNumber()
  deductions?: number;

  @IsOptional()
  @IsNumber()
  netSalary?: number;

  @IsOptional()
  @IsNumber()
  netPay?: number;

  @IsOptional()
  @IsEnum(BankStatus)
  bankStatus?: BankStatus;

  @IsOptional()
  @IsNumber()
  bonus?: number;

  @IsOptional()
  @IsNumber()
  benefit?: number;

  @IsOptional()
  exception?: string;
}
