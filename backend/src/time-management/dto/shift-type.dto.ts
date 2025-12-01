import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateShiftTypeDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsBoolean()
    @IsOptional()
    active?: boolean;
}

export class UpdateShiftTypeDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsBoolean()
    @IsOptional()
    active?: boolean;
}
