export class ReviewRequestDto {
  approverId: string;
  action: 'APPROVE' | 'REJECT' | 'OVERRIDE';
  isHR?: boolean;
  comments?: string;
}
