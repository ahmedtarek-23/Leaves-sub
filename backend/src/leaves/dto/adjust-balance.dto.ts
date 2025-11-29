import { IsMongoId, IsNumber, IsString } from 'class-validator';

export class AdjustBalanceDto {
  @IsMongoId()
  employeeId: string;

  @IsMongoId()
  leaveTypeId: string;

  @IsNumber()
  amount: number;

  @IsString()
  justification: string;

  @IsMongoId()
  hrUserId: string;
}
