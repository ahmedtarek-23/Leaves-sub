import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ManualAdjustmentLogDocument = HydratedDocument<ManualAdjustmentLog>;

@Schema({ timestamps: true })
export class ManualAdjustmentLog {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'LeaveType', required: true })
  leaveTypeId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  reason: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  hrUserId: Types.ObjectId;

  @Prop()
  previousBalance?: number;

  @Prop()
  newBalance?: number;

  @Prop({ default: 'MANUAL_ADJUSTMENT' })
  source?: string;

  @Prop()
  referenceId?: string;
}

export const ManualAdjustmentLogSchema = SchemaFactory.createForClass(ManualAdjustmentLog);
