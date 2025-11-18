import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Define the possible statuses for a payroll run, based on the workflow
export type PayrollRunStatus = 
  | 'Draft' 
  | 'Under Review' 
  | 'Waiting Manager Approval' 
  | 'Waiting Finance Approval' 
  | 'Approved' 
  | 'Frozen'
  | 'Locked' 
  | 'Paid' 
  | 'Payment Failed'
  | 'Rejected';

// Sub-schema for approval chain tracking
@Schema()
class ApprovalStage {
  @Prop({ 
    required: true, 
    enum: ['SPECIALIST_REVIEW', 'MANAGER_APPROVAL', 'FINANCE_APPROVAL'] 
  })
  stage: string;

  @Prop({ type: Types.ObjectId, required: true })
  approver: Types.ObjectId;

  @Prop({ required: true, enum: ['APPROVED', 'REJECTED', 'PENDING'], default: 'PENDING' })
  decision: string;

  @Prop({ required: true, default: Date.now })
  timestamp: Date;

  @Prop({ required: false })
  notes?: string;
}

const ApprovalStageSchema = SchemaFactory.createForClass(ApprovalStage);

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
      'Frozen',
      'Locked', 
      'Paid', 
      'Payment Failed',
      'Rejected'
    ], 
    default: 'Draft' 
  })
  status: PayrollRunStatus;

  // Total net amount to be disbursed across all employees in this run
  @Prop({ required: true, default: 0 })
  totalNetPay: number;

  // Total gross amount across all employees in this run
  @Prop({ required: true, default: 0 })
  totalGrossPay: number;

  // User who initiated this payroll run
  @Prop({ type: Types.ObjectId, required: true })
  initiatedByUserId: Types.ObjectId;

  // Approval chain tracking for Phase 3
  @Prop({ type: [ApprovalStageSchema], default: [] })
  approvalChain: ApprovalStage[];

  // Timestamp when the payroll run was locked by the Payroll Manager (Phase 3)
  @Prop({ type: Date, required: false })
  lockDate?: Date;

  // Freeze tracking for Phase 3
  @Prop({ type: Date, required: false })
  freezeDate?: Date;

  @Prop({ type: String, required: false })
  freezeReason?: string;

  @Prop({ type: Types.ObjectId, required: false })
  frozenBy?: Types.ObjectId;

  // Justification required if the run is rejected or unfrozen
  @Prop({ required: false })
  rejectionReason?: string;
}

export const PayrollRunSchema = SchemaFactory.createForClass(PayrollRun);

// Add index for fast querying by period and status
PayrollRunSchema.index({ payrollPeriodId: 1, status: 1 });

// Index for date-range queries
PayrollRunSchema.index({ startDate: 1, endDate: 1 });
