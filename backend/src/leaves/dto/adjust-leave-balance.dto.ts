import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class AdjustLeaveBalanceDto {
    @IsString()
    @IsNotEmpty()
    employeeId: string;

    @IsString()
    @IsNotEmpty()
    leaveTypeId: string;

    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsString()
    @IsNotEmpty()
    reason: string;

    @IsString()
    @IsNotEmpty()
    hrUserId: string;
}
