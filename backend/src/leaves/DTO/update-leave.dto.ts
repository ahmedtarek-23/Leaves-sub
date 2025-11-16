import { PartialType } from '@nestjs/mapped-types';
import { CreateLeaveDto } from './create-leave.dto';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateLeaveDto extends PartialType(CreateLeaveDto) {
  @IsString()
  @IsOptional()
  status?: 'Pending' | 'Approved' | 'Rejected';
}