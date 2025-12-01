export class GetRequestsFilterDto {
  employeeId?: string;
  status?: string;
  leaveTypeId?: string;
  managerId?: string;
  from?: string | Date;
  to?: string | Date;
}
