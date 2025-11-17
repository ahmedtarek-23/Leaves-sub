import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AttendanceDocument = Attendance & Document;

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ required: true, index: true })
  employeeId: string;

  @Prop({ required: true, index: true })
  date: Date;

  @Prop({ type: Date })
  clockIn?: Date;

  @Prop({ type: Date })
  clockOut?: Date;

  @Prop({ required: true })
  shiftId: string;

  @Prop({
    required: true,
    enum: ['present', 'late', 'absent', 'short-time', 'pending'],
    default: 'pending',
    index: true,
  })
  status: string;

  @Prop({ default: 0 })
  lateMinutes: number;

  @Prop({ default: 0 })
  shortTimeMinutes: number;

  @Prop()
  notes?: string;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
