import { IsBoolean, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PunchPolicy } from '../models/enums';

export class CreateShiftDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsMongoId()
    @IsNotEmpty()
    shiftType: string;

    @IsString()
    @IsNotEmpty()
    startTime: string; // HH:mm

    @IsString()
    @IsNotEmpty()
    endTime: string; // HH:mm

    @IsEnum(PunchPolicy)
    @IsOptional()
    punchPolicy?: PunchPolicy;

    @IsNumber()
    @IsOptional()
    graceInMinutes?: number;

    @IsNumber()
    @IsOptional()
    graceOutMinutes?: number;

    @IsBoolean()
    @IsOptional()
    requiresApprovalForOvertime?: boolean;

    @IsBoolean()
    @IsOptional()
    active?: boolean;
}

export class UpdateShiftDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsMongoId()
    @IsOptional()
    shiftType?: string;

    @IsString()
    @IsOptional()
    startTime?: string;

    @IsString()
    @IsOptional()
    endTime?: string;

    @IsEnum(PunchPolicy)
    @IsOptional()
    punchPolicy?: PunchPolicy;

    @IsNumber()
    @IsOptional()
    graceInMinutes?: number;

    @IsNumber()
    @IsOptional()
    graceOutMinutes?: number;

    @IsBoolean()
    @IsOptional()
    requiresApprovalForOvertime?: boolean;

    @IsBoolean()
    @IsOptional()
    active?: boolean;
}
