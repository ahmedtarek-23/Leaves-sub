import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LeaveAccrualDocument = HydratedDocument<LeaveAccrual>;

@Schema({ timestamps: true })
export class LeaveAccrual {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'LeaveType', required: true })
  leaveTypeId: Types.ObjectId;

  @Prop({ required: true })
  accrualDate: Date;

  @Prop({ required: true })
  accrualAmount: number;

  @Prop({ default: 0 })
  roundedAmount: number;

  @Prop()
  periodStart: Date;

  @Prop()
  periodEnd: Date;

  @Prop({ default: false })
  skipped: boolean; // True if accrual was skipped (e.g., during unpaid leave)

  @Prop()
  skipReason?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const LeaveAccrualSchema = SchemaFactory.createForClass(LeaveAccrual);

// Index for efficient querying
LeaveAccrualSchema.index({ employeeId: 1, leaveTypeId: 1, accrualDate: -1 });
LeaveAccrualSchema.index({ employeeId: 1, skipped: 1 });
