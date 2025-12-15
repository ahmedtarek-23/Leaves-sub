// Summary view for pending/active termination reviews (OFF-001).
export class TerminationReviewSummaryDto {
  id: string;
  employeeId: string;
  // TODO[SCHEMA]: OFF-001 / BR-4 expects mandatory effective date; schema marks terminationDate optional.
  effectiveDate?: Date;
  reasonDescription: string;
  status: string;
  requestedById?: string;
}