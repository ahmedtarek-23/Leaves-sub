// File: apps/payroll-api/src/configuration-policy/schema/payroll-pollicy.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

// keep only the shared type imports you need (do not implement IConfigPolicy here)
import {
  ITaxRule,
  IInsuranceBracket,
  IPenaltyRule,
} from '../../../shared/types/payroll/payroll-utils.interface';

// Sub-document schemas
const TaxRuleSchema = new MongooseSchema<ITaxRule>(
  {
    taxRuleId: { type: String, required: true },
    countryCode: { type: String, required: true },
    minIncome: { type: Number, required: true, min: 0 },
    maxIncome: { type: MongooseSchema.Types.Mixed, required: true },
    taxRate: { type: Number, required: true, min: 0, max: 1 },
    effectiveDate: { type: Date, required: true },
  },
  { _id: false },
);

const InsuranceBracketSchema = new MongooseSchema<IInsuranceBracket>(
  {
    bracketId: { type: String, required: true, unique: true },
    minSalary: { type: Number, required: true, min: 0 },
    maxSalary: { type: Number, required: true, min: 0 },
    employeeRate: { type: Number, required: true, min: 0, max: 1 },
    companyRate: { type: Number, required: true, min: 0, max: 1 },
  },
  { _id: false },
);

const PenaltyRuleSchema = new MongooseSchema<IPenaltyRule>(
  {
    penaltyCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['FIXED_AMOUNT', 'PERCENTAGE_OF_BASE', 'UNPAID_DAY_RATE'],
      required: true,
    },
    value: { type: Number, required: true, min: 0 },
    appliesTo: {
      type: String,
      enum: ['Lateness', 'Misconduct', 'Absenteeism'],
      required: true,
    },
  },
  { _id: false },
);

// Main schema
export type PayrollPolicyDocument = PayrollPolicy & Document;

@Schema({ timestamps: true })
export class PayrollPolicy {
  @Prop({ type: String, required: true, unique: true })
  policyCode: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({
    type: String,
    enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ARCHIVED'],
    default: 'DRAFT',
  })
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ARCHIVED';

  @Prop({ type: [TaxRuleSchema], default: [] })
  taxRules: ITaxRule[];

  @Prop({ type: [InsuranceBracketSchema], default: [] })
  insuranceBrackets: IInsuranceBracket[];

  @Prop({ type: [PenaltyRuleSchema], default: [] })
  misconductPenalties: IPenaltyRule[];

  @Prop({
    type: String,
    enum: ['MONTHLY', 'WEEKLY', 'BI_WEEKLY'],
    default: 'MONTHLY',
  })
  payFrequency: 'MONTHLY' | 'WEEKLY' | 'BI_WEEKLY';

  @Prop({ type: Number, min: 1, max: 31, default: 25 })
  payDate: number;

  @Prop({ type: String })
  configuredByUserId: string;

  @Prop({ type: String })
  lastApprovedByUserId: string;

  @Prop({ type: Date, default: null })
  approvedDate: Date;
}

export const PayrollPolicySchema = SchemaFactory.createForClass(PayrollPolicy);
