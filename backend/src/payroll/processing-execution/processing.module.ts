import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigurationPolicyModule } from '../configuration-policy/configuration.module';

import { Schema } from 'mongoose';

// --- PayrollRun Schema and Class ---
export class PayrollRun {}
export const PayrollRunSchema = new Schema(
  {
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
  },
  { timestamps: true },
);

// --- EmployeePayRecord Schema and Class ---
export class EmployeePayRecord {}
export const EmployeePayRecordSchema = new Schema({
  employeeId: { type: String, required: true },
  grossPay: { type: Number, required: true },
});

// --- PenaltyDeduction Schema and Class ---
export class PenaltyDeduction {}
export const PenaltyDeductionSchema = new Schema({
  reason: { type: String },
  amount: { type: Number },
});

import { ProcessingExecutionController } from './processing-execution.controller';
import { ProcessingExecutionService } from './processing-execution.service';

@Module({
  imports: [
    ConfigurationPolicyModule,
    MongooseModule.forFeature([
      { name: PayrollRun.name, schema: PayrollRunSchema },
      { name: EmployeePayRecord.name, schema: EmployeePayRecordSchema },
      { name: PenaltyDeduction.name, schema: PenaltyDeductionSchema },
    ]),
  ],
  controllers: [ProcessingExecutionController],
  providers: [ProcessingExecutionService],
  exports: [ProcessingExecutionService],
})
export class ProcessingModule {}
