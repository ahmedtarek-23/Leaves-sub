import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Define the inner structure for a deduction or allowance item
class PayItem {
  @Prop({ required: true })
  code: string; // e.g., 'TXS', 'TRANS_ALL'

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: 0 })
  rateOrAmount: number; // Percentage or fixed amount
}

@Schema()
export class PayrollConfig extends Document {
  @Prop({ required: true, unique: true })
  configName: string; // e.g., "Default Monthly Payroll Policy"

  @Prop({ required: true })
  effectiveDate: Date;

  // Stores rules for statutory deductions
  @Prop({ type: [PayItem] })
  taxBrackets: PayItem[];

  @Prop({ type: [PayItem] })
  insuranceBrackets: PayItem[];

  // Stores rules for organizational additions (allowances, bonuses)
  @Prop({ type: [PayItem] })
  allowances: PayItem[];

  @Prop({ type: [PayItem] })
  deductionPolicies: PayItem[]; // For penalties, unpaid leave rules

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const PayrollConfigSchema = SchemaFactory.createForClass(PayrollConfig);
