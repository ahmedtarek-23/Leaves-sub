export class CreateOnboardingChecklistDto {
  name!: string;
  description?: string;
  departmentId?: string;
  jobTemplateId?: string;
  tasks: { title: string; description?: string; dueRelativeDays?: number }[] = [];

  // TODO[SCHEMA]: ONB-001 requires persisting reusable checklist templates. Current schema lacks a dedicated checklist entity.
}