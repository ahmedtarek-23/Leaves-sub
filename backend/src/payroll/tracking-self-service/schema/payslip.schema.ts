import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from 'mongoose';

@Schema()
export class Payslip {
  @Prop({ required: true })
  employeeId: string;

  @Prop({ required: true })
  period: string;

  // Reference to Team 6's EmployeePayRecord for full breakdown
  @Prop({ type: Types.ObjectId, ref: 'EmployeePayRecord', required: true })
  employeePayRecordId: Types.ObjectId;

  // Summary fields (pulled from EmployeePayRecord)
  @Prop()
  baseSalary: number;

  @Prop()
  grossSalary: number;

  @Prop()
  netSalary: number;

  @Prop()
  finalPaidSalary: number;

  // Special case fields for itemization
  @Prop()
  signingBonus?: number;

  @Prop()
  resignationBenefit?: number;

  @Prop()
  terminationBenefit?: number;

  @Prop()
  leaveEncashment?: number;

  @Prop({ default: 'Generated' })
  status: 'Generated' | 'Paid';

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const PayslipSchema = SchemaFactory.createForClass(Payslip);
