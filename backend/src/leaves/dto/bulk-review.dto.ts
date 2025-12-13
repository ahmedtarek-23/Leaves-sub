import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsArray, IsIn } from 'class-validator';

export class BulkReviewDto {
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    requestIds: string[];

    @IsString()
    @IsNotEmpty()
    approverId: string;

    @IsString()
    @IsIn(['APPROVE', 'REJECT'])
    @IsNotEmpty()
    action: 'APPROVE' | 'REJECT';

    @IsBoolean()
    @IsNotEmpty()
    isHR: boolean;

    @IsString()
    @IsOptional()
    comments?: string;
}
