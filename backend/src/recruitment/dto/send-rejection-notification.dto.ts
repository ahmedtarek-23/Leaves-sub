import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class SendRejectionNotificationDto {
  @IsMongoId()
  changedBy: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  templateKey?: string;
}