import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OfferDocument = Offer & Document;

@Schema({ timestamps: true })
export class Offer {
  @Prop({ type: Types.ObjectId, ref: 'Application', required: true })
  applicationId: Types.ObjectId;

  @Prop({ required: true })
  positionTitle: string;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  departmentId: Types.ObjectId;

  @Prop({ required: true })
  salary: number;

  @Prop()
  benefits: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({
    enum: ['DRAFT', 'APPROVED', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
    default: 'DRAFT'
  })
  status: string;

  @Prop()
  offerLetterUrl: string; // Stored offer letter document

  @Prop()
  sentDate: Date;

  @Prop()
  acceptedDate: Date;

  @Prop()
  rejectionReason: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  approvedBy: Types.ObjectId; // HR Manager who approved

  @Prop({ default: true })
  active: boolean;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);