import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Define the structure for a single pay component breakdown (e.g., Allowance, Tax, Deduction)
// This mirrors the pay-component.interface.ts concept.
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

@Schema({ timestamps: true })
export class EmployeePayRecord extends Document {
  // Link to the overall PayrollRun document
  @Prop({
    type: Types.ObjectId,
    ref: 'PayrollRun',
    required: true,
    index: true,
  })
  payrollRunId: Types.ObjectId;

  // Employee ID (referenced from the main Employee Profile Subsystem)
  @Prop({ type: Types.ObjectId, required: true, index: true })
  employeeId: Types.ObjectId;

  // Basic salary information retrieved from the Configuration/Employee modules (Team 1)
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

  // Detailed breakdown of all components for the payslip
  @Prop({ type: [PayComponentSchema], required: true, default: [] })
  payComponentBreakdown: PayComponent[];

  // Total penalties applied from external systems like Time Management (Phase 1.1.B)
  @Prop({ required: true, default: 0 })
  totalPenalties: number;

  // Flag if an anomaly was detected during Phase 2 (e.g., Negative Net Pay)
  @Prop({ required: true, default: false })
  hasAnomaly: boolean;

  // List of exceptions/anomalies (e.g., 'Missing Bank Account', 'Negative Net Pay')
  @Prop([String])
  exceptions: string[];

  // Status of the payslip for the employee (used by Tracking Subsystem - Team 7)
  @Prop({ required: true, default: false })
  payslipGenerated: boolean;
}

export const EmployeePayRecordSchema =
  SchemaFactory.createForClass(EmployeePayRecord);

// Compound index for finding an employee's record within a specific run quickly
EmployeePayRecordSchema.index(
  { payrollRunId: 1, employeeId: 1 },
  { unique: true },
);
