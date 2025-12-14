// schemas/leave-request.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { LeaveStatus } from '../enums/leave-status.enum';

export type LeaveRequestDocument = Document & LeaveRequest;

@Schema({ timestamps: true })
export class LeaveRequest extends Document {
  declare _id: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'LeaveType', required: true })
  leaveTypeId: Types.ObjectId;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  dates: { from: Date; to: Date };

  @Prop({ required: true })
  durationDays: number;

  @Prop()
  justification?: string;

  @Prop({ type: Types.ObjectId, ref: 'Attachment' })
  attachmentId?: Types.ObjectId;

  @Prop({
    type: [
      {
        role: String,
        status: String,
        decidedBy: { type: Types.ObjectId, ref: 'Employee' },
        decidedAt: Date,
      },
    ],
    default: [],
  })
  approvalFlow: {
    role: string;
    status: string;
    decidedBy?: Types.ObjectId;
    decidedAt?: Date;
  }[];

  @Prop({ default: false })
  isSynced: boolean;

  @Prop()
  syncedAt?: Date;

  @Prop({
    type: String,
    enum: LeaveStatus,
    default: LeaveStatus.PENDING,
  })
  status: LeaveStatus;

  @Prop({ default: false })
  requiresHRConversion: boolean;

  @Prop({ default: false })
  irregularPatternFlag: boolean;

  @Prop()
  actualDuration?: number;

  @Prop()
  roundedDuration?: number;

  @Prop({ default: 0 })
  excessDays: number;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  managerId?: Types.ObjectId;

  @Prop({ default: false })
  hasAttachments: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Attachment' }] })
  attachments: Types.ObjectId[];

  @Prop({ default: null })
  medicalVerified?: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  medicalVerifiedBy?: Types.ObjectId;

  @Prop()
  medicalVerifiedAt?: Date;

  @Prop()
  medicalVerificationComments?: string;

  @Prop({ default: false })
  flagged?: boolean;

  @Prop()
  flagReason?: string;

  @Prop({ type: String, enum: ['LOW', 'MEDIUM', 'HIGH'] })
  flagPriority?: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  flaggedBy?: Types.ObjectId;

  @Prop()
  flaggedAt?: Date;

  @Prop({ default: false })
  isEscalated?: boolean;

  @Prop()
  escalatedAt?: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop()
  rejectionReason?: string;
}

export const LeaveRequestSchema = SchemaFactory.createForClass(LeaveRequest);
