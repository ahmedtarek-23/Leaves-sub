import { ClearanceItemDto } from './clearance-item.dto';

// OFF-010 – per-employee clearance instance view.
export class ClearanceInstanceDto {
  id: string;
  employeeId: string;
  terminationRequestId?: string;
  overallStatus: string;
  items: ClearanceItemDto[];
}