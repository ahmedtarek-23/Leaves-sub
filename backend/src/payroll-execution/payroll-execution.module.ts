import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayrollExecutionController } from './payroll-execution.controller';
import { PayrollExecutionService } from './payroll-execution.service';
<<<<<<< Updated upstream
import { terminationAndResignationBenefits, terminationAndResignationBenefitsSchema } from '../payroll-configuration/models/terminationAndResignationBenefits';
import { employeePayrollDetails, employeePayrollDetailsSchema } from './models/employeePayrollDetails.schema';
import { employeePenalties, employeePenaltiesSchema } from './models/employeePenalties.schema';
import { employeeSigningBonus, employeeSigningBonusSchema } from './models/EmployeeSigningBonus.schema';
import { payrollRuns, payrollRunsSchema } from './models/payrollRuns.schema';
=======
import { PayrollCalculationService } from './payroll-calculation.service';

// Import schemas
>>>>>>> Stashed changes
import { paySlip, paySlipSchema } from './models/payslip.schema';
import { employeePenalties, employeePenaltiesSchema } from './models/employeePenalties.schema';
import { employeeSigningBonus, employeeSigningBonusSchema } from './models/EmployeeSigningBonus.schema';
import { EmployeeTerminationResignation, EmployeeTerminationResignationSchema } from './models/EmployeeTerminationResignation.schema';
import { employeePayrollDetails, employeePayrollDetailsSchema } from './models/employeePayrollDetails.schema';
import { payrollRuns, payrollRunsSchema } from './models/payrollRuns.schema';

@Module({
<<<<<<< Updated upstream
  imports: [forwardRef(() => PayrollTrackingModule), PayrollConfigurationModule, TimeManagementModule, EmployeeProfileModule, LeavesModule,
  MongooseModule.forFeature([
    { name: payrollRuns.name, schema: payrollRunsSchema },
    { name: paySlip.name, schema: paySlipSchema },
    { name: employeePayrollDetails.name, schema: employeePayrollDetailsSchema },
    { name: employeeSigningBonus.name, schema: employeeSigningBonusSchema },
    { name: terminationAndResignationBenefits.name, schema: terminationAndResignationBenefitsSchema },
    { name: employeePenalties.name, schema: employeePenaltiesSchema },

  ])],
  controllers: [PayrollExecutionController],
  providers: [PayrollExecutionService],
  exports: [PayrollExecutionService]
})
export class PayrollExecutionModule { }
=======
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
>>>>>>> Stashed changes
