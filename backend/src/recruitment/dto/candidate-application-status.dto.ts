import { ApplicationStatus } from '../enums/application-status.enum';
import { ApplicationStage } from '../enums/application-stage.enum';

export class CandidateApplicationStatusDto {
  applicationId: string;
  requisitionId: string;
  jobTitle?: string;
  location?: string;
  status: ApplicationStatus;
  stage: ApplicationStage;
  lastUpdated?: Date;
}