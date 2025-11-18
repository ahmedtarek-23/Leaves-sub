import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ApplicationDocument = Application & Document;

@Schema({ timestamps: true })
export class Application {
  @Prop({ type: Types.ObjectId, ref: 'Candidate', required: true })
  candidateId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'JobRequisition', required: true })
  jobRequisitionId: Types.ObjectId;

  @Prop({
    enum: [
      'SCREENING',
      'SHORTLISTED',
      'INTERVIEW',
      'OFFER',
      'HIRED',
      'REJECTED',
    ],
    default: 'SCREENING',
  })
  stage: string;

  @Prop({ type: Number, min: 0, max: 100, default: 0 })
  progressPercentage: number; // Auto-calculated based on stage

  @Prop()
  appliedDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  assignedRecruiter: Types.ObjectId; // HR employee handling this application

  @Prop()
  rejectionReason: string;

  @Prop({ default: true })
  active: boolean;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
