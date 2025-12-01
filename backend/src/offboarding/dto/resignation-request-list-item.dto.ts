// OFF-019 – listing view of resignation requests for dashboards or employee history.
export class ResignationRequestListItemDto {
  id!: string;
  submittedAt!: Date;
  proposedLastWorkingDay!: Date;
  status!: string;
}