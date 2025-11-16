import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class LeaveBalance extends Document {
  // Foreign key link to the Employee Profile module 
  @Prop({ required: true, index: true, type: Types.ObjectId })
  employeeId: Types.ObjectId; 

  // Links to the LeavePolicy schema (code)
  @Prop({ required: true, index: true })
  leaveTypeCode: string; 

  // Total days entitled in the current cycle (REQ-007)
  @Prop({ default: 0 })
  entitled: number;

  // Days accumulated so far 
  @Prop({ default: 0 })
  accrued: number;

  // Days already taken (REQ-042)
  @Prop({ default: 0 })
  taken: number;

  // Available balance (Accrued + CarryOver - Taken)
  @Prop({ default: 0 })
  remaining: number; 

  // Days carried over from the previous cycle (REQ-041)
  @Prop({ default: 0 })
  carryOver: number;

  @Prop({ required: true })
  resetDate: Date;
}

export const LeaveBalanceSchema = SchemaFactory.createForClass(LeaveBalance);