import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateLatenessRuleDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsOptional()
    gracePeriodMinutes?: number;

    @IsNumber()
    @IsOptional()
    deductionForEachMinute?: number;

    @IsBoolean()
    @IsOptional()
    active?: boolean;
}

export class UpdateLatenessRuleDto extends PartialType(CreateLatenessRuleDto) {}

