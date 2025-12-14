import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateOvertimeRuleDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    @IsOptional()
    active?: boolean;

    @IsBoolean()
    @IsOptional()
    approved?: boolean;
}

export class UpdateOvertimeRuleDto extends PartialType(CreateOvertimeRuleDto) {}

