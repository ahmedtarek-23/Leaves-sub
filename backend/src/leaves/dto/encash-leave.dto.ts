import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class EncashLeaveDto {
    @IsNumber()
    @IsNotEmpty()
    dailySalaryRate: number;

    @IsString()
    @IsOptional()
    employeeId?: string;

    @IsNumber()
    @IsOptional()
    days?: number;

    @IsString()
    @IsOptional()
    reason?: string;
}
