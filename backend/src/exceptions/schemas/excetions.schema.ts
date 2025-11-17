import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExceptionDocument = Exception & Document;

@Schema({ timestamps: true })
export class Exception {
  @Prop({ required: true }) employeeId: string;


  @Prop({ required: true }) type: string;

  @Prop() reason: string;

  @Prop() value?: number;

  @Prop({ default: "PENDING" }) status: string;

  @Prop() managerComment?: string;
}

export const ExceptionSchema = SchemaFactory.createForClass(Exception);