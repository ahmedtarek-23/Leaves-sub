import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ApprovalWorkflowDocument = HydratedDocument<ApprovalWorkflow>;

@Schema({ timestamps: true })
export class ApprovalWorkflow {
  @Prop({ required: true })
  name: string;

  @Prop({
    type: [
      {
        role: String,
        actionRequired: String,
        timeoutHours: Number,
      },
    ],
    default: [],
  })
  steps: { role: string; actionRequired: string; timeoutHours?: number }[];

  @Prop({ default: true })
  active: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  updatedBy?: Types.ObjectId;
}

export const ApprovalWorkflowSchema =
  SchemaFactory.createForClass(ApprovalWorkflow);
