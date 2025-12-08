import { Types } from "mongoose";

export class ReadEmployeePenaltiesDTO {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  penalties?: {
    reason: string;
    amount: number;
  }[];
}
