import { Types } from "mongoose";

export class ReadTerminationResignationDTO {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  benefitId: Types.ObjectId;
  givenAmount: number;
  terminationId: Types.ObjectId;
  status: string;
}
