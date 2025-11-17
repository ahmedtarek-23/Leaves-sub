export class CreateExceptionDto {
  employeeId: string;
  type: string; // OVERTIME | PERMISSION | CORRECTION
  reason: string;
  value?: number;
}