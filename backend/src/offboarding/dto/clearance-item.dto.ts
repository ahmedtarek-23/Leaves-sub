// OFF-006 / OFF-010 – clearance item structure for assets and responsibilities.
export class ClearanceItemDto {
  id: string;
  department: string;
  label: string;
  status: string;
  remarks?: string;
}