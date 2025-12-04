// Detailed termination review view including optional performance link (OFF-001).
export class TerminationReviewDetailDto {
  id: string;
  employeeId: string;
  requestedById?: string;
  // TODO[SCHEMA]: OFF-001 / BR-4 expects a required effective date, but the current schema
  // treats terminationDate as optional. Exposing it as optional here to reflect schema.
  effectiveDate?: Date;
  reasonCode?: string;
  reasonDescription: string;
  status: string;
  performanceRecordId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}