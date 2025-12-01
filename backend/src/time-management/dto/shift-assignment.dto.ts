import { IsDateString, IsEnum, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { ShiftAssignmentStatus } from '../models/enums';

export class AssignShiftDto {
    @IsMongoId()
    @IsOptional()
    employeeId?: string;

    @IsMongoId()
    @IsOptional()
    departmentId?: string;

    @IsMongoId()
    @IsOptional()
    positionId?: string;

    @IsMongoId()
    @IsNotEmpty()
    shiftId: string;

    @IsMongoId()
    @IsOptional()
    scheduleRuleId?: string;

    @IsDateString()
    @IsNotEmpty()
    startDate: Date;

    @IsDateString()
    @IsOptional()
    endDate?: Date;
}

export class UpdateShiftAssignmentDto {
    @IsDateString()
    @IsOptional()
    endDate?: Date;

    @IsEnum(ShiftAssignmentStatus)
    @IsOptional()
    status?: ShiftAssignmentStatus;
}
