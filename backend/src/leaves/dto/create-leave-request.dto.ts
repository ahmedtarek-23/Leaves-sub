export class CreateLeaveRequestDto {
  employeeId: string;
  leaveTypeId: string;
  startDate: Date | string;
  endDate: Date | string;
  durationDays: number;
  reason?: string;
  attachments?: string[];
}
