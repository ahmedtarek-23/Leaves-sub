import { OnboardingTaskDto } from './onboarding-task.dto';

export class OnboardingTrackerDto {
  onboardingId!: string;
  candidateId!: string;
  employeeProfileId?: string;
  startDate?: Date;
  departmentId?: string;
  tasks: OnboardingTaskDto[] = [];
}