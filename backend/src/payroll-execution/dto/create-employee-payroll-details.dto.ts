import { IsMongoId, IsNumber, IsEnum, IsOptional } from "class-validator";
import { BankStatus } from "../enums/payroll-execution-enum";

export class CreateEmployeePayrollDetailsDto {
    @IsMongoId()
    employeeId: string;

    @IsNumber()
    baseSalary: number;

    @IsNumber()
    allowances: number;

    @IsNumber()
    deductions: number;

    @IsNumber()
    netSalary: number;

    @IsNumber()
     netPay: number;

    @IsEnum(BankStatus)
    bankStatus: BankStatus;

    @IsOptional()
    @IsNumber()
    bonus?: number;

    @IsOptional()
    @IsNumber()
    benefit?: number;

    @IsMongoId()
    payrollRunId: string;

    @IsOptional()
    exception?: string;
}
