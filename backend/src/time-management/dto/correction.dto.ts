import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CorrectionRequestStatus } from '../models/enums';

export class CreateCorrectionDto {
    @IsMongoId()
    @IsNotEmpty()
    employeeId: string;

    @IsMongoId()
    @IsNotEmpty()
    attendanceRecord: string;

    @IsString()
    @IsOptional()
    reason?: string;

    @IsEnum(CorrectionRequestStatus)
    @IsOptional()
    status?: CorrectionRequestStatus;
}

export class UpdateCorrectionDto extends PartialType(CreateCorrectionDto) {}

