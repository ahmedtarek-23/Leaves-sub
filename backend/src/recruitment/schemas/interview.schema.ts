import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InterviewDocument = Interview & Document;

@Schema({ timestamps: true })
export class Interview {
  @Prop({ type: Types.ObjectId, ref: 'Application', required: true })
  applicationId: Types.ObjectId;

  @Prop({ required: true })
  interviewDate: Date;

  @Prop({
    enum: ['IN_PERSON', 'VIDEO', 'PHONE'],
    default: 'VIDEO'
  })
  interviewType: string;

  @Prop()
  location: string; // For in-person interviews

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Employee' }] })
  panelMembers: Types.ObjectId[]; // Interview panel

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  scheduledBy: Types.ObjectId; // HR employee

  @Prop({
    enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    default: 'SCHEDULED'
  })
  status: string;

  @Prop({ type: Number, min: 1, max: 5 })
  overallScore: number; // Average of panel scores

  @Prop()
  feedback: string;

  @Prop({ default: true })
  active: boolean;
}

export const InterviewSchema = SchemaFactory.createForClass(Interview);