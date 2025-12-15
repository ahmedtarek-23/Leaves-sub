// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model, Types } from 'mongoose';
// import { paySlip, PayslipDocument } from './models/payslip.schema';
// import { PayrollCalculationService } from './payroll-calculation.service';
// import { EmployeeProfile } from '../employee-profile/models/employee-profile.schema';

// @Injectable()
// export class PayrollService {
//   constructor(
//     @InjectModel(paySlip.name) private payslipModel: Model<PayslipDocument>,
//     private calculationService: PayrollCalculationService,
//   ) {}

//   async generateDraftPayroll(employees: EmployeeProfile[]) {
//     const draftPayslips = [];

//     for (const emp of employees) {
//       const calculated = await this.calculationService.calculatePayroll(emp);

//       // -------------------
//       // Anomaly detection
//       if (!emp.bankAccountNumber) {
//         calculated.anomalies.push('Missing bank account');
//       }
//       if (calculated.netPay < 0) {
//         calculated.anomalies.push('Negative net pay');
//       }

//       // -------------------
//       // Save draft payslip
//       const draft = new this.payslipModel({
//         employeeId: emp._id,
//         payrollRunId: new Types.ObjectId(), // generate or link later
//         earningsDetails: calculated.earningsDetails,
//         deductionsDetails: calculated.deductionsDetails,
//         totalGrossSalary: calculated.totalGross,
//         totaDeductions: calculated.totalDeductions,
//         netPay: calculated.netPay,
//         paymentStatus: 'PENDING',
//       });

//       await draft.save();
//       draftPayslips.push(draft);
//     }

//     return draftPayslips;
//   }
// }
