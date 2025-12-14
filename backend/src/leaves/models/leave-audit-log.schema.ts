import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LeaveAuditLogDocument = HydratedDocument<LeaveAuditLog>;

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  CANCEL = 'CANCEL',
  DELEGATE = 'DELEGATE',
  ADJUST = 'ADJUST',
}

@Schema({ timestamps: true })
export class LeaveAuditLog {
  @Prop({ type: Types.ObjectId, ref: 'LeaveRequest' })
  leaveRequestId?: Types.ObjectId;

  @Prop({ required: true, type: String, enum: AuditAction })
  action: AuditAction;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  performedBy: Types.ObjectId;

  @Prop({ type: Object })
  oldValues?: Record<string, any>;

  @Prop({ type: Object })
  newValues?: Record<string, any>;

  @Prop()
  reason?: string;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;
}

export const LeaveAuditLogSchema = SchemaFactory.createForClass(LeaveAuditLog);

// Index for efficient querying
LeaveAuditLogSchema.index({ leaveRequestId: 1, createdAt: -1 });
LeaveAuditLogSchema.index({ performedBy: 1, createdAt: -1 });
