import { IsMongoId, IsEnum, IsOptional } from 'class-validator';

export class CreateApplicationDto {
  @IsMongoId()
  candidateId: string;

  @IsMongoId()
  jobRequisitionId: string;

  @IsMongoId()
  @IsOptional()
  assignedRecruiter?: string;
}
