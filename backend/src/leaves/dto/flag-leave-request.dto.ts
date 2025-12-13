import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class FlagLeaveRequestDto {
    @IsString()
    @IsNotEmpty()
    flaggedBy: string;

    @IsString()
    @IsNotEmpty()
    reason: string;

    @IsString()
    @IsIn(['LOW', 'MEDIUM', 'HIGH'])
    @IsNotEmpty()
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
}
