import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

// Correct imports using the validated alias @shared-types/
import { IPayStructure } from '../../../shared/types/payroll/pay-structure.interface';
import { IPayComponent } from '../../../shared/types/payroll/payroll-utils.interface';

// Sub-Schema for Pay Components
const PayComponentSchema = new MongooseSchema<IPayComponent>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ['FIXED', 'PERCENTAGE', 'FORMULA'],
      required: true,
    },
    value: { type: Number, required: true, min: 0 },
    taxable: { type: Boolean, default: false },
    isGrossAddition: { type: Boolean, required: true },
  },
  { _id: false },
);

// Sub-Schema for Department Link (External Dependency)
const DepartmentLinkSchema = new MongooseSchema(
  {
    departmentId: { type: String, required: true },
    departmentCode: { type: String, required: true },
  },
  { _id: false },
);

// --- Main Pay Structure Schema ---

export type PayStructureDocument = PayStructure & Document;

@Schema({ timestamps: true })
export class PayStructure implements IPayStructure {
  @Prop({ type: String, required: true, unique: true })
  payGradeId: string;

  @Prop({ type: String, required: true })
  gradeName: string;

  @Prop({
    type: String,
    enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ARCHIVED'],
    default: 'DRAFT',
  })
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ARCHIVED';

  @Prop({ type: Number, required: true, min: 0 })
  grossSalary: number;

  @Prop({ type: [PayComponentSchema], default: [] })
  allowances: IPayComponent[];

  @Prop({ type: [PayComponentSchema], default: [] })
  deductions: IPayComponent[];

  @Prop({ type: [DepartmentLinkSchema], default: [] })
  validForDepartments: { departmentId: string; departmentCode: string }[];

  @Prop({ type: [String], default: [] })
  associatedPositions: string[];

  @Prop({
    type: String,
    enum: ['FULL_TIME', 'PART_TIME', 'CONTRACTOR'],
    required: true,
  })
  contractType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR';

  // Audit and Approval
  @Prop({ type: String })
  configuredByUserId: string;

  @Prop({ type: String })
  lastApprovedByUserId: string;

  @Prop({ type: Date, default: null })
  approvedDate: Date;
}

export const PayStructureSchema = SchemaFactory.createForClass(PayStructure);
