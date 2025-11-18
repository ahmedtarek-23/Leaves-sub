import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Define the structure for a single pay component breakdown (e.g., Allowance, Tax, Deduction)
@Schema()
class PayComponent {
  @Prop({ required: true })
  componentName: string; // e.g., 'Base Salary', 'Transportation Allowance', 'Income Tax'

  @Prop({ required: true })
  type: 'Earning' | 'Deduction' | 'Statutory'; // Earning (adds), Deduction/Statutory (subtracts)

  @Prop({ required: true })
  amount: number;

  @Prop({ required: false })
  source?: string; // e.g., 'PayGrade', 'Leaves Module', 'Time Management'
}

const PayComponentSchema = SchemaFactory.createForClass(PayComponent);

// Sub-schema for structured anomaly tracking
@Schema()
class Anomaly {
  @Prop({ 
    required: true, 
    enum: ['MISSING_BANK_ACCOUNT', 'NEGATIVE_NET_PAY', 'UNUSUAL_AMOUNT_CHANGE', 'OTHER'] 
  })
  anomalyType: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true, default: Date.now })
  detectedAt: Date;

  @Prop({ required: false })
  resolvedAt?: Date;

  @Prop({ type: Types.ObjectId, required: false })
  resolvedBy?: Types.ObjectId;
}

const AnomalySchema = SchemaFactory.createForClass(Anomaly);

@Schema({ timestamps: true })
export class EmployeePayRecord extends Document {
  // Link to the overall PayrollRun document
  @Prop({ type: Types.ObjectId, ref: 'PayrollRun', required: true, index: true })
  payrollRunId: Types.ObjectId;

  // Employee ID (referenced from the main Employee Profile Subsystem)
  @Prop({ type: Types.ObjectId, required: true, index: true })
  employeeId: Types.ObjectId;

  @Prop({ type: String, required: true })
  payGradeId: string; // References Team 5's PayStructure.payGradeId

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  departmentId: Types.ObjectId; // From Team 1's Department schema


  // Bank account number for anomaly detection
  @Prop({ required: false })
  bankAccountNumber?: string;

  // HR event type (normal, new hire, resignation, termination)
  @Prop({ 
    type: String, 
    enum: ['NORMAL', 'NEW_HIRE', 'RESIGNATION', 'TERMINATION'], 
    default: 'NORMAL' 
  })
  hrEventType: string;

  // Basic salary information retrieved from the Configuration/Employee modules
  @Prop({ required: true })
  baseSalary: number;

  // Total calculated earnings (Base + Allowances + Bonuses)
  @Prop({ required: true })
  grossSalary: number;

  // Gross Salary - Taxes - Insurance
  @Prop({ required: true })
  netSalaryBeforePenalties: number;

  // Final amount to be paid (Net Salary - Penalties - Other Deductions)
  @Prop({ required: true })
  finalPaidSalary: number;

  // Signing bonus amount for new hires
  @Prop({ type: Number, default: 0 })
  signingBonus?: number;

  // Signing bonus approval status
  @Prop({ type: Boolean, default: false })
  signingBonusApproved?: boolean;

  // Resignation benefit for resigned employees
  @Prop({ type: Number, default: 0 })
  resignationBenefit?: number;

  // Termination benefit for terminated employees
  @Prop({ type: Number, default: 0 })
  terminationBenefit?: number;

  // Leave encashment amount from Leaves module
  @Prop({ type: Number, default: 0 })
  leaveEncashment?: number;

  // Detailed breakdown of all components for the payslip
  @Prop({ type: [PayComponentSchema], required: true, default: [] })
  payComponentBreakdown: PayComponent[];

  // Total penalties applied from external systems like Time Management
  @Prop({ required: true, default: 0 })
  totalPenalties: number;

  // Structured anomaly tracking with resolution metadata
  @Prop({ type: [AnomalySchema], default: [] })
  anomalies: Anomaly[];
}

export const EmployeePayRecordSchema = SchemaFactory.createForClass(EmployeePayRecord);

// Compound index for finding an employee's record within a specific run quickly
EmployeePayRecordSchema.index({ payrollRunId: 1, employeeId: 1 }, { unique: true });

// Index for anomaly queries
EmployeePayRecordSchema.index({ 'anomalies.anomalyType': 1 });
