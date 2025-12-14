import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { paySlip, PayslipDocument } from './models/payslip.schema';
import { EmployeeProfile } from '../employee-profile/models/employee-profile.schema';
import { employeePenalties } from './models/employeePenalties.schema';
import { employeeSigningBonus } from './models/EmployeeSigningBonus.schema';
import { EmployeeTerminationResignation } from './models/EmployeeTerminationResignation.schema';
import { employeePayrollDetails } from './models/employeePayrollDetails.schema';
import { CreatePayslipDto, EarningsDto, DeductionsDto } from './dto/create-payslip.dto';
import { PaySlipPaymentStatus, BenefitStatus } from './enums/payroll-execution-enum';
import { CreateEmployeePenaltiesDto } from './dto/create-employee-penalties.dto';
import { CreateSigningBonusDto } from './dto/create-signing-bonus.dto';
import { CreateEmployeeTerminationResignationDto } from './dto/create-termination-resignation-benefits.dto';
import { UpdateEmployeeTerminationResignationDto } from './dto/update-termination-resignation-benefits.dto';
import { CreatePayrollRunsDto } from './dto/create-payroll-runs.dto';
import { UpdatePayrollRunsDto } from './dto/update-payroll-runs.dto';



@Injectable()
export class PayrollCalculationService {
  constructor(
    @InjectModel(paySlip.name) private payslipModel: Model<PayslipDocument>,
    @InjectModel(employeePenalties.name) private penaltiesModel: Model<employeePenalties>,
    @InjectModel(employeeSigningBonus.name) private signingBonusModel: Model<employeeSigningBonus>,
    @InjectModel(EmployeeTerminationResignation.name) private terminationModel: Model<EmployeeTerminationResignation>,
    @InjectModel(employeePayrollDetails.name) private payrollDetailsModel: Model<employeePayrollDetails>,
  ) {}

  // -------------------
  // Create or update payslip
  async upsertPayslip(dto: CreatePayslipDto) {
    const existing = await this.payslipModel.findOne({
      employeeId: dto.employeeId,
      payrollRunId: dto.payrollRunId,
    });

    if (existing) {
      // Update existing
      await this.payslipModel.findByIdAndUpdate(existing._id, dto, { new: true });
      return existing;
    }

    // Create new
    const payslip = new this.payslipModel({
      ...dto,
      paymentStatus: dto.paymentStatus || PaySlipPaymentStatus.PENDING,
    });
    await payslip.save();
    return payslip;
  }

  // -------------------
  // Example: calculate net pay
  calculateNetPay(
    baseSalary: number,
    allowances: { amount: number }[] = [],
    bonuses: { amount: number }[] = [],
    benefits: { amount: number }[] = [],
    taxes: { rate: number }[] = [],
    insurances: { employeeRate: number }[] = [],
    penalties: { amount: number }[] = [],
  ): { totalGross: number; totalDeductions: number; netPay: number } {
    const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);
    const totalBonuses = bonuses.reduce((sum, b) => sum + b.amount, 0);
    const totalBenefits = benefits.reduce((sum, b) => sum + b.amount, 0);
    const totalGross = baseSalary + totalAllowances + totalBonuses + totalBenefits;

    const totalTaxes = taxes.reduce((sum, t) => sum + totalGross * (t.rate / 100), 0);
    const totalInsurance = insurances.reduce((sum, i) => sum + totalGross * (i.employeeRate / 100), 0);
    const totalPenalties = penalties.reduce((sum, p) => sum + p.amount, 0);

    const totalDeductions = totalTaxes + totalInsurance + totalPenalties;
    const netPay = totalGross - totalDeductions;

    return { totalGross, totalDeductions, netPay };
  }

  // -------------------
  // Example: handle penalties
  async upsertEmployeePenalties(dto: CreateEmployeePenaltiesDto) {
    const existing = await this.penaltiesModel.findOne({ employeeId: dto.employeeId });
    if (existing) {
      await this.penaltiesModel.findByIdAndUpdate(existing._id, dto, { new: true });
      return existing;
    }
    const penalties = new this.penaltiesModel(dto);
    await penalties.save();
    return penalties;
  }

  // -------------------
  // Example: handle signing bonuses
  async upsertSigningBonus(dto: CreateSigningBonusDto) {
    const existing = await this.signingBonusModel.findOne({ positionName: dto.positionName });
    if (existing) {
      await this.signingBonusModel.findByIdAndUpdate(existing._id, dto, { new: true });
      return existing;
    }
    const bonus = new this.signingBonusModel(dto);
    await bonus.save();
    return bonus;
  }

  // -------------------
  // Example: handle termination/benefits
  async upsertTermination(dto: CreateEmployeeTerminationResignationDto | UpdateEmployeeTerminationResignationDto) {
    const existing = await this.terminationModel.findOne({ employeeId: dto.employeeId, terminationId: dto.terminationId });
    if (existing) {
      await this.terminationModel.findByIdAndUpdate(existing._id, dto, { new: true });
      return existing;
    }
    const termination = new this.terminationModel(dto);
    await termination.save();
    return termination;
  }

  // -------------------
  // Payroll run creation/update
  async upsertPayrollRun(dto: CreatePayrollRunsDto | UpdatePayrollRunsDto) {
    const existing = await this.payrollDetailsModel.findOne({ runId: dto['runId'] });
    if (existing) {
      await this.payrollDetailsModel.findByIdAndUpdate(existing._id, dto, { new: true });
      return existing;
    }
    const payrollRun = new this.payrollDetailsModel(dto);
    await payrollRun.save();
    return payrollRun;
  }
}
