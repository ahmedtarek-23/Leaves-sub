import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { RequisitionPublishStatus } from './update-requisition-status.dto';

export class JobRequisitionFiltersDto {
  @IsEnum(RequisitionPublishStatus)
  @IsOptional()
  publishStatus?: RequisitionPublishStatus;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsMongoId()
  @IsOptional()
  hiringManagerId?: string;
}