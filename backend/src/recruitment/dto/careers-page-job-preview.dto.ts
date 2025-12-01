import { RequisitionPublishStatus } from './update-requisition-status.dto';

export class CareersPageJobPreviewDto {
  requisitionId: string;
  title?: string;
  department?: string;
  location?: string;
  openings: number;
  qualifications?: string[];
  skills?: string[];
  description?: string;
  postingDate?: Date;
  expiryDate?: Date;
  publishStatus?: RequisitionPublishStatus;
}