import { IsNotEmpty, IsString, IsDateString, IsOptional, IsArray } from 'class-validator';

export class DelegateApprovalDto {
    @IsString()
    @IsNotEmpty()
    delegateTo: string;

    @IsDateString()
    @IsNotEmpty()
    startDate: Date;

    @IsDateString()
    @IsNotEmpty()
    endDate: Date;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    leaveTypeIds?: string[];
}
