import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AttachmentDocument = HydratedDocument<Attachment>;

@Schema({ timestamps: true })
export class Attachment {
  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  filePath: string;

  @Prop()
  fileType?: string;

  @Prop()
  size?: number;

  @Prop({ type: Types.ObjectId, ref: 'LeaveRequest' })
  leaveRequestId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  uploadedBy?: Types.ObjectId;

  @Prop()
  uploadedAt?: Date;

  @Prop()
  documentType?: string;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);
