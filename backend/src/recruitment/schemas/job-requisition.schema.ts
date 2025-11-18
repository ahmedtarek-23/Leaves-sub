import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JobRequisitionDocument = JobRequisition & Document;

@Schema({ timestamps: true })
export class JobRequisition {
  @Prop({ required: true })
  jobTitle: string;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  departmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Position', required: true })
  positionId: Types.ObjectId;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true, min: 1 })
  openings: number;

  @Prop({
    enum: ['DRAFT', 'PUBLISHED', 'CLOSED'],
    default: 'DRAFT',
  })
  status: string;

  @Prop([String])
  qualifications: string[];

  @Prop([String])
  skillsRequired: string[];

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  hiringManagerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  createdBy: Types.ObjectId; // HR employee

  @Prop({ default: true })
  active: boolean;
}

export const JobRequisitionSchema =
  SchemaFactory.createForClass(JobRequisition);
