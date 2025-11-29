import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LeaveEncashmentDocument = HydratedDocument<LeaveEncashment>;

@Schema({ timestamps: true })
export class LeaveEncashment {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'LeaveType', required: true })
  leaveTypeId: Types.ObjectId;

  @Prop({ required: true })
  daysEncashed: number;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  payPeriod: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  processedBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  updatedBy?: Types.ObjectId;
}

export const LeaveEncashmentSchema =
  SchemaFactory.createForClass(LeaveEncashment);
