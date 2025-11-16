import { IsNumber, IsString } from 'class-validator';

export class SubmitDisputeDto {
  @IsString()
  evaluationId: string;

  @IsNumber()
  employeeId: number;

  @IsString()
  reason: string;
}
