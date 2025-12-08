import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class SendOfferDto {
  @IsMongoId()
  offerId: string;

  @IsString()
  @IsOptional()
  deliveryChannel?: string;

  @IsString()
  @IsOptional()
  messageOverride?: string;
}