import { Types } from "mongoose";

export class ReadPayslipDTO {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  payrollRunId: Types.ObjectId;
  
  earningsDetails: {
    baseSalary: number;
    allowances?: { name: string; amount: number }[];
    bonuses?: { name: string; amount: number }[];
    benefits?: { name: string; amount: number }[];
    refunds?: { description: string; amount: number }[];
  };

  deductionsDetails: {
    taxes: { name: string; rate: number }[];
    insurances?: { name: string; employeeRate: number; employerRate: number }[];
    penalties?: { reason: string; amount: number }[];
  };

  totalGrossSalary: number;
  totalDeductions?: number;
  netPay: number;
  paymentStatus?: string;
}
