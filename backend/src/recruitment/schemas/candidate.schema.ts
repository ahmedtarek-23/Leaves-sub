import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose'; // Added Types import

export type CandidateDocument = Candidate & Document;

@Schema({ timestamps: true })
export class Candidate {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  phone: string;

  @Prop()
  resumeUrl: string;

  @Prop({ default: false })
  consentGiven: boolean; // GDPR compliance

  @Prop({
    enum: ['INTERNAL', 'REFERRAL', 'EXTERNAL'],
    default: 'EXTERNAL',
  })
  referralSource: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  referredBy: Types.ObjectId; // If internal referral

  @Prop({ default: true })
  active: boolean;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);
