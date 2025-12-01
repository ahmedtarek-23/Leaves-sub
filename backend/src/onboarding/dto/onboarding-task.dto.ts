import { OnboardingTaskStatus } from '../../recruitment/enums/onboarding-task-status.enum';

export class OnboardingTaskDto {
  id!: string;
  title!: string;
  description?: string;
  status!: OnboardingTaskStatus | string;
  dueDate?: Date;
  completedAt?: Date;
  responsiblePartyId?: string;
}