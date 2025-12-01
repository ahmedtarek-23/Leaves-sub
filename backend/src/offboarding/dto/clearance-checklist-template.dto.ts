// OFF-006 – reusable offboarding clearance checklist configuration.
export class ClearanceChecklistTemplateDto {
  id?: string;
  name: string;
  items: {
    department: string;
    label: string;
  }[];
}