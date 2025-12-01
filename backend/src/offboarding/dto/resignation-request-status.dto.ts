// OFF-019 – status view of a resignation request for employee tracking.
export class ResignationRequestStatusDto {
  id!: string;
  employeeId!: string;
  submittedAt!: Date;
  proposedLastWorkingDay!: Date;
  reasonDescription!: string;
  status!: string; // TODO[SCHEMA]: OFF-018/019 would benefit from explicit workflow status/step fields.
  currentStep?: string;
}