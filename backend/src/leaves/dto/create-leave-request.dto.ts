import { IsNotEmpty, IsString, IsDateString, IsOptional, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class LeaveDatesDto {
    @IsDateString()
    @IsNotEmpty()
    from: Date;

    @IsDateString()
    @IsNotEmpty()
    to: Date;
}

export class CreateLeaveRequestDto {
    @IsString()
    @IsNotEmpty()
    employeeId: string;

    @IsString()
    @IsNotEmpty()
    leaveTypeId: string;

    @IsObject()
    @ValidateNested()
    @Type(() => LeaveDatesDto)
    @IsNotEmpty()
    dates: LeaveDatesDto;

    @IsString()
    @IsOptional()
    justification?: string;

    @IsBoolean()
    @IsOptional()
    isPostLeave?: boolean;
}
