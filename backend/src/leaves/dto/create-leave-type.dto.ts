export class CreateLeaveTypeDto {
  name: string;
  categoryId?: string;
  accrualMethod?: string;
  yearlyRate?: number;
  monthlyRate?: number;
}
