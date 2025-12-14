import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LeaveDelegationDocument = HydratedDocument<LeaveDelegation>;

@Schema({ timestamps: true })
export class LeaveDelegation {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  delegatorId: Types.ObjectId; // Manager who delegates

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  delegateeId: Types.ObjectId; // Person receiving delegation

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  reason?: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  createdBy?: Types.ObjectId;

  @Prop()
  revokedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  revokedBy?: Types.ObjectId;
}

export const LeaveDelegationSchema =
  SchemaFactory.createForClass(LeaveDelegation);

// Index for efficient querying
LeaveDelegationSchema.index({ delegatorId: 1, startDate: 1, endDate: 1 });
LeaveDelegationSchema.index({ delegateeId: 1, isActive: 1 });
