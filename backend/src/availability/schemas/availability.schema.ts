import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AvailabilityDocument = Availability & Document;

@Schema({ timestamps: true })
export class Availability {
  @Prop({ required: true })
  employeeId: string;

  @Prop({ required: true })
  dayOfWeek: string; // e.g., "Monday", "Tuesday", etc.

  @Prop({ required: true })
  startTime: string; // e.g., "09:00"

  @Prop({ required: true })
  endTime: string; // e.g., "17:00"

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop()
  notes?: string;
}

export const AvailabilitySchema = SchemaFactory.createForClass(Availability);
