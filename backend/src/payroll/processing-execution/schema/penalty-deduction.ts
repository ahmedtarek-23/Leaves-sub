import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Represents a penalty or a specific, non-standard deduction applied to an employee
// Data for this would come from Time Management (Team 2) or Leaves (Team 4)
@Schema({ timestamps: true })
export class PenaltyDeduction extends Document {
  // Unique ID for the specific penalty source event
  @Prop({ type: Types.ObjectId, required: true })
  sourceTransactionId: Types.ObjectId;

  // Employee ID being penalized/deducted
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true, index: true })
  employeeId: Types.ObjectId;

  // The subsystem that generated the penalty/deduction
  @Prop({ required: true, enum: ['TimeManagement', 'Leaves', 'Performance', 'Other'] })
  sourceModule: string;

  // Type of penalty/deduction (e.g., 'Missing Hours', 'Unpaid Leave Day', 'Misconduct Fine')
  @Prop({ required: true })
  type: string;

  // Human-readable description for transparency
  @Prop({ type: String, required: false })
  description?: string;

  // Link to policy rule from Config module
  @Prop({ type: String, required: false })
  penaltyRuleCode?: string;

  // Amount deducted in local currency
  @Prop({ required: true })
  amount: number;

  // Date/period the penalty relates to
  @Prop({ type: Date, required: true })
  effectiveDate: Date;

  // Reference to the payroll run where this penalty was processed
  @Prop({ type: Types.ObjectId, ref: 'PayrollRun', required: false })
  payrollRunId: Types.ObjectId;

  // Status to ensure it is only processed once
  @Prop({ required: true, enum: ['Pending', 'Processed', 'Cancelled'], default: 'Pending' })
  status: string;
}

export const PenaltyDeductionSchema = SchemaFactory.createForClass(PenaltyDeduction);

// Index for fetching pending penalties by date
PenaltyDeductionSchema.index({ status: 1, effectiveDate: 1 });
