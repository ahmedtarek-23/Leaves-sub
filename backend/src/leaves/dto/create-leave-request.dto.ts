import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsMongoId,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateLeaveRequestDto {
  @IsMongoId()
  employeeId: string;

  @IsMongoId()
  leaveTypeId: string;

  @IsDateString()
  from: string;

  @IsDateString()
  to: string;

  @IsOptional()
  @IsString()
  justification?: string;

  @IsOptional()
  @IsMongoId()
  attachmentId?: string;

  @IsOptional()
  @IsNumber()
  durationDays?: number;
}
