import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type HolidayDocument = HydratedDocument<Holiday>;

@Schema({ timestamps: true })
export class Holiday {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ default: false })
  recurring: boolean; // Recurring like 1 Jan every year

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  updatedBy?: Types.ObjectId;
}

export const HolidaySchema = SchemaFactory.createForClass(Holiday);
