import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Payslip {
  @Prop({ required: true })
  employeeId: string;

  @Prop({ required: true })
  period: string;

  @Prop()
  baseSalary: number;

  @Prop()
  allowances: number;

  @Prop()
  deductions: number;

  @Prop()
  netSalary: number;

  // Placeholders for integration
  @Prop()
  penalties?: number;

  @Prop()
  leaveEncashment?: number;

  @Prop({ default: 'Generated' })
  status: 'Generated' | 'Paid';

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const PayslipSchema = SchemaFactory.createForClass(Payslip);
