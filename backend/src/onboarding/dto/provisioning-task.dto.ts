export class ProvisioningTaskDto {
  taskId!: string;
  category!: 'IT' | 'FACILITIES' | 'ACCESS';
  title!: string;
  description?: string;
  dueDate?: Date;
  status!: string;
  responsiblePartyId?: string;
  notes?: string;

  // TODO[SCHEMA]: ONB-009/ONB-012 require task categories and richer metadata; current task schema stores only name/department/notes.
}