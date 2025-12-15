import { IsDateString, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// OFF-018, BR-6 – captures employee-initiated resignation with clearly stated reason.
export class CreateResignationRequestDto {
  @IsMongoId()
  employeeId!: string;

  @IsDateString()
  proposedLastWorkingDay!: Date;

  @IsString()
  @IsOptional()
  reasonCode?: string;

  @IsString()
  @IsNotEmpty()
  reasonDescription!: string;

  @IsMongoId()
  @IsOptional()
  contractId?: string; // TODO[SCHEMA]: TerminationRequest requires contractId; enforcing via DTO when available.
}
