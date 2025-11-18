import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PayrollDisputeDocument = PayrollDispute & Document;

@Schema()
export class PayrollDispute {
  @Prop({ required: true }) employeeId: string;
  @Prop({ required: true }) payslipId: string;

  @Prop({ required: true }) issue: string;
  @Prop() description?: string;

  @Prop({ default: 'Pending' })
  status: 'Pending' | 'Approved' | 'Rejected';

  @Prop() resolutionNote?: string;
  @Prop({ default: Date.now }) createdAt: Date;
}

export const PayrollDisputeSchema =
  SchemaFactory.createForClass(PayrollDispute);
