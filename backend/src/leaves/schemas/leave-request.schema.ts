import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Defines the individual step in the multi-level workflow
class ApprovalStep {
  @Prop({ type: Types.ObjectId }) // Refers to Manager/HR user ID
  approverId: Types.ObjectId; 

  @Prop({ default: 'PENDING' })
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED';

  @Prop()
  comments: string;

  @Prop()
  actionDate: Date;
}

@Schema({ timestamps: true })
export class LeaveRequest extends Document {
  // Foreign key link to the Employee Profile module 
  @Prop({ required: true, index: true, type: Types.ObjectId })
  employeeId: Types.ObjectId;

  // Links to the LeavePolicy schema (code)
  @Prop({ required: true })
  leaveTypeCode: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  // Calculated duration, net of non-working days (BR 23)
  @Prop({ required: true })
  durationDays: number;

  @Prop()
  justification: string;

  // URL or path to uploaded documents (REQ-016)
  @Prop()
  documentUrl: string;

  // Current overall status of the request (REQ-021/022)
  @Prop({ default: 'PENDING' })
  status: string; 

  // Tracks the multi-level approval chain (REQ-020, REQ-025)
  @Prop({ type: [ApprovalStep] })
  approvalWorkflow: ApprovalStep[]; 

  // True if submitted after the leave started (REQ-031)
  @Prop({ default: false })
  isPostLeave: boolean;

  // Flag to confirm data has synced with Payroll and Time Management (REQ-042)
  @Prop({ default: false })
  isSynced: boolean;
}

export const LeaveRequestSchema = SchemaFactory.createForClass(LeaveRequest);
