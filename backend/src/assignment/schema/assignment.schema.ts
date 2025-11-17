import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AssignmentDocument = Assignment & Document;

@Schema({ timestamps: true })
export class Assignment {
  @Prop({ required: true }) employeeId: string;
  @Prop({ required: true }) shiftId: string;
  @Prop({ required: true, default: () => new Date() }) startDate: Date;
  @Prop() endDate?: Date;
  @Prop({ default: true })
  active: boolean;
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
