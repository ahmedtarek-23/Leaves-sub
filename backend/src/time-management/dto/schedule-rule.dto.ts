import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateScheduleRuleDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    pattern: string; // e.g., "Mon-Fri 9-5" or cron-like, TBD by implementation details but string for now

    @IsBoolean()
    @IsOptional()
    active?: boolean;
}

export class UpdateScheduleRuleDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    pattern?: string;

    @IsBoolean()
    @IsOptional()
    active?: boolean;
}
