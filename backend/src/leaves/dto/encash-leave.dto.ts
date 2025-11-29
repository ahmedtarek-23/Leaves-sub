import { IsMongoId, IsNumber, IsString } from 'class-validator';

export class EncashLeaveDto {
  @IsMongoId()
  employeeId: string;

  @IsMongoId()
  leaveTypeId: string;

  @IsNumber()
  days: number;

  @IsString()
  payPeriod: string;
}
