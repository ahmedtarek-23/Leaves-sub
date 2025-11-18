import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Define the possible statuses for a payroll run, based on the workflow
export type PayrollRunStatus =
  | 'Draft'
  | 'Under Review'
  | 'Waiting Manager Approval'
  | 'Waiting Finance Approval'
  | 'Approved'
  | 'Locked'
  | 'Paid'
  | 'Rejected';

@Schema({ timestamps: true })
export class PayrollRun extends Document {
  // Unique identifier for the payroll period (e.g., '2025-11')
  @Prop({ required: true, unique: true })
  payrollPeriodId: string;

  // The descriptive period (e.g., "November 2025 Pay Cycle")
  @Prop({ required: true })
  periodName: string;

  // Start date of the pay period
  @Prop({ required: true, type: Date })
  startDate: Date;

  // End date of the pay period
  @Prop({ required: true, type: Date })
  endDate: Date;

  // Current status of the payroll run (used in Phase 2 & 3 of the workflow)
  @Prop({
    required: true,
    enum: [
      'Draft',
      'Under Review',
      'Waiting Manager Approval',
      'Waiting Finance Approval',
      'Approved',
      'Locked',
      'Paid',
      'Rejected',
    ],
    default: 'Draft',
  })
  status: PayrollRunStatus;

  // Total net amount to be disbursed across all employees in this run
  @Prop({ required: true, default: 0 })
  totalNetPay: number;

  // Total gross amount across all employees in this run
  @Prop({ required: true, default: 0 })
  totalGrossPay: number;

  // User ID of the specialist who initiated the run (referenced from EmployeeProfile/Auth)
  @Prop({ type: Types.ObjectId, required: false })
  initiatedByUserId: Types.ObjectId;

  // Timestamp when the payroll run was locked by the Payroll Manager (Phase 3)
  @Prop({ type: Date, required: false })
  lockDate: Date;

  // Justification required if the run is rejected or unfrozen
  @Prop({ required: false })
  rejectionReason: string;
}

export const PayrollRunSchema = SchemaFactory.createForClass(PayrollRun);

// Add index for fast querying by period and status
PayrollRunSchema.index({ payrollPeriodId: 1, status: 1 });
