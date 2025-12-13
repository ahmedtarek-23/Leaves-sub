import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsIn } from 'class-validator';

export class ReviewLeaveRequestDto {
    @IsString()
    @IsNotEmpty()
    approverId: string;

    @IsString()
    @IsIn(['APPROVE', 'REJECT', 'OVERRIDE'])
    @IsNotEmpty()
    action: 'APPROVE' | 'REJECT' | 'OVERRIDE';

    @IsBoolean()
    @IsNotEmpty()
    isHR: boolean;

    @IsString()
    @IsOptional()
    comments?: string;
}
