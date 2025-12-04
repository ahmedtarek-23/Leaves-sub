import { IsDateString, IsOptional } from 'class-validator';

export class PublishJobRequisitionDto {
  @IsDateString()
  @IsOptional()
  postingDate?: Date;

  @IsDateString()
  @IsOptional()
  expiryDate?: Date;
}