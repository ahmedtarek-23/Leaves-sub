import { IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';

export class UpdateOfferApprovalStatusDto {
  @IsMongoId()
  offerId: string;

  @IsMongoId()
  approvedBy: string;

  @IsBoolean()
  approved: boolean;

  @IsString()
  @IsOptional()
  comments?: string;
}