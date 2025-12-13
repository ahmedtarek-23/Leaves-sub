import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LeaveEncashmentRecordDocument = HydratedDocument<LeaveEncashmentRecord>;

@Schema({ timestamps: true })
export class LeaveEncashmentRecord {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'LeaveType', required: true })
  leaveTypeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'LeaveRequest' })
  leaveRequestId?: Types.ObjectId;

  @Prop({ required: true })
  encashDays: number;

  @Prop({ required: true })
  dailyRate: number;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  processedBy?: Types.ObjectId; // HR or system user

  @Prop()
  payrollReference?: string;
}

export const LeaveEncashmentRecordSchema = SchemaFactory.createForClass(LeaveEncashmentRecord);
