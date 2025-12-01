import { Module } from '@nestjs/common';
import { PayrollExecutionController } from './payroll-execution.controller';
import { PayrollExecutionService } from './payroll-execution.service';
import { PayrollCalculationService } from './payroll-calculation.service';

@Module({
  imports: [], // No Database connection (Mongoose)
  controllers: [PayrollExecutionController],
  providers: [PayrollExecutionService, PayrollCalculationService],
})
export class PayrollExecutionModule {}