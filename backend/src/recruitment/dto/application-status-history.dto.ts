export class ApplicationStatusHistoryDto {
  applicationId: string;
  oldStage?: string;
  newStage?: string;
  oldStatus?: string;
  newStatus?: string;
  changedBy: string;
  changedAt?: Date;
}