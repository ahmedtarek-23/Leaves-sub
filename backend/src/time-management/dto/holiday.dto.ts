import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { HolidayType } from '../models/enums';

export class CreateHolidayDto {
    @IsEnum(HolidayType)
    @IsNotEmpty()
    type: HolidayType;

    @IsDateString()
    @IsNotEmpty()
    startDate: Date;

    @IsDateString()
    @IsOptional()
    endDate?: Date;

    @IsString()
    @IsOptional()
    name?: string;

    @IsBoolean()
    @IsOptional()
    active?: boolean;
}

export class UpdateHolidayDto {
    @IsEnum(HolidayType)
    @IsOptional()
    type?: HolidayType;

    @IsDateString()
    @IsOptional()
    startDate?: Date;

    @IsDateString()
    @IsOptional()
    endDate?: Date;

    @IsString()
    @IsOptional()
    name?: string;

    @IsBoolean()
    @IsOptional()
    active?: boolean;
}
