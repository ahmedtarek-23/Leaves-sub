import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayrollExecutionController } from './payroll-execution.controller';
import { PayrollExecutionService } from './payroll-execution.service';
import { PayrollCalculationService } from './payroll-calculation.service';

// Import schemas
import { paySlip, paySlipSchema } from './models/payslip.schema';
import { employeePenalties, employeePenaltiesSchema } from './models/employeePenalties.schema';
import { employeeSigningBonus, employeeSigningBonusSchema } from './models/EmployeeSigningBonus.schema';
import { EmployeeTerminationResignation, EmployeeTerminationResignationSchema } from './models/EmployeeTerminationResignation.schema';
import { employeePayrollDetails, employeePayrollDetailsSchema } from './models/employeePayrollDetails.schema';
import { payrollRuns, payrollRunsSchema } from './models/payrollRuns.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: paySlip.name, schema: paySlipSchema },
      { name: employeePenalties.name, schema: employeePenaltiesSchema },
      { name: employeeSigningBonus.name, schema: employeeSigningBonusSchema },
      { name: EmployeeTerminationResignation.name, schema: EmployeeTerminationResignationSchema },
      { name: employeePayrollDetails.name, schema: employeePayrollDetailsSchema },
      { name: payrollRuns.name, schema: payrollRunsSchema },
    ]),
  ],
  controllers: [PayrollExecutionController],
  providers: [PayrollExecutionService, PayrollCalculationService],
})
export class PayrollExecutionModule {}