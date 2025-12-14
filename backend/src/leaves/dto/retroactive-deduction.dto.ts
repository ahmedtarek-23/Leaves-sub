import { IsNotEmpty, IsString, IsObject, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DeductionDatesDto {
    @IsDateString()
    @IsNotEmpty()
    from: Date;

    @IsDateString()
    @IsNotEmpty()
    to: Date;
}

export class RetroactiveDeductionDto {
    @IsString()
    @IsNotEmpty()
    employeeId: string;

    @IsString()
    @IsNotEmpty()
    leaveTypeId: string;

    @IsObject()
    @ValidateNested()
    @Type(() => DeductionDatesDto)
    @IsNotEmpty()
    dates: DeductionDatesDto;

    @IsString()
    @IsNotEmpty()
    reason: string;

    @IsString()
    @IsNotEmpty()
    hrUserId: string;
}
