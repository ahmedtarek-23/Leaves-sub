import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class TagReferralApplicationDto {
  @IsMongoId()
  applicationId: string;

  @IsMongoId()
  @IsOptional()
  referralId?: string;

  @IsString()
  @IsOptional()
  referralSource?: string;
}