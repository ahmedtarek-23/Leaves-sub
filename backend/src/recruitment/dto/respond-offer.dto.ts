import { IsEnum, IsOptional } from 'class-validator';
import { OfferResponseStatus } from '../enums/offer-response-status.enum';
import { OfferFinalStatus } from '../enums/offer-final-status.enum';

export class RespondOfferDto {
  @IsEnum(OfferResponseStatus)
  applicantResponse: OfferResponseStatus;

  @IsEnum(OfferFinalStatus)
  @IsOptional()
  finalStatus?: OfferFinalStatus;
}