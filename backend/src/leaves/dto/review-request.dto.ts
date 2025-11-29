import { IsMongoId, IsEnum, IsOptional, IsString } from 'class-validator';
import { ReviewAction } from '../enums/review-action.enum';

export class ReviewRequestDto {
  @IsMongoId()
  approverId: string;

  @IsEnum(ReviewAction)
  action: ReviewAction;

  @IsOptional()
  @IsString()
  comment?: string;
}
