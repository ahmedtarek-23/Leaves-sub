import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class VerifyMedicalDto {
    @IsString()
    @IsNotEmpty()
    verifiedBy: string;

    @IsBoolean()
    @IsNotEmpty()
    isValid: boolean;

    @IsString()
    @IsOptional()
    comments?: string;
}
