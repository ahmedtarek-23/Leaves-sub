import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ShiftDocument = Shift & Document;

@Schema()
export class Shift {
  @Prop({ required: true }) name: string; 
  @Prop({ required: true }) code: string; 
  @Prop({ required: true }) startTime: string;  
  @Prop({ required: true }) endTime: string;   
  @Prop() breaks?: string; 
  @Prop() rotationPattern?: string; 
  @Prop({ default: true }) isActive: boolean;
}

export const ShiftSchema = SchemaFactory.createForClass(Shift);
