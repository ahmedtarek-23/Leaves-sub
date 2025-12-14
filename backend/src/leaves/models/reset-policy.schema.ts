import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ResetPolicyDocument = HydratedDocument<ResetPolicy>;

export enum ResetType {
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM',
}

@Schema({ timestamps: true })
export class ResetPolicy {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'LeaveType', required: true })
  leaveTypeId: Types.ObjectId;

  @Prop({ type: String, enum: ResetType, default: ResetType.YEARLY })
  resetType: ResetType;

  @Prop()
  customResetDate?: Date; // For CUSTOM reset type (month and day, e.g., April 1st)

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastResetDate?: Date;

  @Prop()
  nextResetDate?: Date;
}

export const ResetPolicySchema = SchemaFactory.createForClass(ResetPolicy);

// Index for efficient querying
ResetPolicySchema.index({ organizationId: 1, leaveTypeId: 1 }, { unique: true });
ResetPolicySchema.index({ nextResetDate: 1 });
