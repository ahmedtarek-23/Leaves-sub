export class CreateApprovalWorkflowDto {
  name: string;
  steps: Array<{ role: string; sequence: number; }>;
}
