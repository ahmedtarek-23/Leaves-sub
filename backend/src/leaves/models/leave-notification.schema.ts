import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LeaveNotificationDocument = HydratedDocument<LeaveNotification>;

export enum NotificationType {
  REQUEST_SUBMITTED = 'REQUEST_SUBMITTED',
  REQUEST_APPROVED = 'REQUEST_APPROVED',
  REQUEST_REJECTED = 'REQUEST_REJECTED',
  REQUEST_CANCELLED = 'REQUEST_CANCELLED',
  YEAR_END_PROCESSING = 'YEAR_END_PROCESSING',
  DELEGATION_ASSIGNED = 'DELEGATION_ASSIGNED',
  DELEGATION_REVOKED = 'DELEGATION_REVOKED',
  BALANCE_ADJUSTED = 'BALANCE_ADJUSTED',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  IN_APP = 'IN_APP',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  DELIVERED = 'DELIVERED',
}

@Schema({ timestamps: true })
export class LeaveNotification {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  recipientId: Types.ObjectId;

  @Prop({ required: true, type: String, enum: NotificationType })
  type: NotificationType;

  @Prop({ required: true, type: String, enum: NotificationChannel })
  channel: NotificationChannel;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: String, enum: NotificationStatus, default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @Prop({ type: Types.ObjectId, ref: 'LeaveRequest' })
  leaveRequestId?: Types.ObjectId;

  @Prop()
  sentAt?: Date;

  @Prop()
  deliveredAt?: Date;

  @Prop()
  errorMessage?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const LeaveNotificationSchema =
  SchemaFactory.createForClass(LeaveNotification);

// Index for efficient querying
LeaveNotificationSchema.index({ recipientId: 1, status: 1, createdAt: -1 });
LeaveNotificationSchema.index({ leaveRequestId: 1 });
LeaveNotificationSchema.index({ type: 1, status: 1 });
