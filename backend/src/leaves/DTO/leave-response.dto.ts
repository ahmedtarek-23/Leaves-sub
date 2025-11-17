import { IsString, IsDateString, IsOptional } from 'class-validator';

export class LeaveResponseDto {
  @IsString()
  id: string;

  @IsString()
  employeeId: string;

  @IsString()
  leaveType: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  status: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  attachmentUrl?: string;
}