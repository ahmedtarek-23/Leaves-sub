import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class LeavePolicy extends Document {
  // Key identifier, linked to payroll (BR 6)
  @Prop({ required: true, unique: true, index: true })
  code: string;

  @Prop({ required: true })
  name: string;

  // e.g., 'DEDUCTIBLE', 'NON_DEDUCTIBLE'
  @Prop({ required: true })
  category: string;

  // Criteria based on tenure, grade, or contract type
  @Prop({ type: Object })
  eligibilityRules: Record<string, any>; 

  // Rate at which leave accumulates (e.g., 2.5 days per month)
  @Prop({ required: true })
  accrualRate: number; 

  // Maximum number of days that can be carried over (BR 55)
  @Prop({ required: true })
  maxCarryOverDays: number;

  @Prop({ default: 'Hire Date' })
  resetCriterionDate: 'Hire Date' | 'Work Receiving Date' | 'Fixed Date';

  // True if supporting documents are mandatory (REQ-016)
  @Prop({ default: false })
  requiresDocument: boolean; 

  // Pay code used for synchronization with the Payroll module (BR 6)
  @Prop()
  payrollPayCode: string; 
}

<<<<<<< HEAD
export const LeavePolicySchema = SchemaFactory.createForClass(LeavePolicy);
=======
export const LeavePolicySchema = SchemaFactory.createForClass(LeavePolicy);
>>>>>>> 46699e5101064e3dc68149602b9bed0fde0307f7
