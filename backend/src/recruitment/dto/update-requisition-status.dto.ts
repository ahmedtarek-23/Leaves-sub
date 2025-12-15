import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum RequisitionPublishStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
}

export class UpdateRequisitionStatusDto {
  @IsEnum(RequisitionPublishStatus)
  publishStatus: RequisitionPublishStatus;

  @IsDateString()
  @IsOptional()
  postingDate?: Date;

  @IsDateString()
  @IsOptional()
  expiryDate?: Date;
}