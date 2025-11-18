import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class ExpenseClaim {
  @Prop({ required: true })
  employeeId: string;

  @Prop({ required: true })
  amount: number;

  @Prop()
  description?: string;

  @Prop()
  receiptUrl?: string;

  @Prop({
    default: 'Pending',
  })
  status: 'Pending' | 'Approved' | 'Rejected';

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ExpenseClaimSchema = SchemaFactory.createForClass(ExpenseClaim);
