import { IsMongoId } from 'class-validator';

export class DelegateApprovalDto {
  @IsMongoId()
  requestId: string;

  @IsMongoId()
  delegateTo: string;

  @IsMongoId()
  delegatorId: string;
}
