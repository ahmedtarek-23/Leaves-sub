export class BulkReviewDto {
  requestIds: string[];
  approverId: string;
  action: 'APPROVE' | 'REJECT';
  isHR: boolean;
  comments?: string;
}
