import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LeaveBalanceDocument = HydratedDocument<LeaveBalance>;

@Schema({ timestamps: true })
export class LeaveBalance {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'LeaveType', required: true })
  leaveTypeId: Types.ObjectId;

  @Prop({ default: 0 })
  accrued: number;

  @Prop({ default: 0 })
  taken: number;

  @Prop({ default: 0 })
  pending: number;

  @Prop({ default: 0 })
  remaining: number;

  @Prop({ default: 0 })
  carryForward: number;

  @Prop({ default: new Date().getFullYear() })
  fiscalYear: number;

  @Prop()
  lastAccrualDate?: Date;

  @Prop()
  nextResetDate?: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const LeaveBalanceSchema = SchemaFactory.createForClass(LeaveBalance);

// Index for efficient querying
LeaveBalanceSchema.index(
  { employeeId: 1, leaveTypeId: 1, fiscalYear: 1 },
  { unique: true },
);
