import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VacationPackageDocument = HydratedDocument<VacationPackage>;

@Schema({ timestamps: true })
export class VacationPackage {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], default: [] })
  leaveTypeCodes: string[]; // codes of leave types included

  @Prop({ default: 0 })
  totalDays: number;

  @Prop({ default: true })
  active: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  assignedToEmployeeId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  updatedBy?: Types.ObjectId;
}

export const VacationPackageSchema =
  SchemaFactory.createForClass(VacationPackage);
