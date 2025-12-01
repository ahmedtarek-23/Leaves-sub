import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { TimeExceptionType, TimeExceptionStatus } from '../models/enums';

export class CreateTimeExceptionDto {
    @IsMongoId()
    @IsNotEmpty()
    employeeId: string;

    @IsEnum(TimeExceptionType)
    @IsNotEmpty()
    type: TimeExceptionType;

    @IsMongoId()
    @IsNotEmpty()
    attendanceRecordId: string;

    @IsMongoId()
    @IsNotEmpty()
    assignedTo: string;

    @IsEnum(TimeExceptionStatus)
    @IsOptional()
    status?: TimeExceptionStatus;

    @IsString()
    @IsOptional()
    reason?: string;
}

export class UpdateTimeExceptionDto extends PartialType(CreateTimeExceptionDto) {}

