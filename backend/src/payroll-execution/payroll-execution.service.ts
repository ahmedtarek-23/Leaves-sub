import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PayrollStatus } from './enums/payroll-status.enum';
import { PayrollCalculationService } from './payroll-calculation.service';

// Import DTOs
import { CreatePayrollRunsDto } from './dto/create-payroll-runs.dto';
import { UpdatePayrollRunsDto } from './dto/update-payroll-runs.dto';

@Injectable()
export class PayrollExecutionService {
  constructor(
    private calculationService: PayrollCalculationService 
  ) {}

  // =================================================================
  // 1. VIEWING DATA (Mock)
  // =================================================================
  async getPayrollById(id: string) {
    return {
      _id: id,
      period: '2025-11',
      status: PayrollStatus.DRAFT,
      isLocked: false,
      rejectionReason: null
    };
  }

  // =================================================================
  // 2. SPECIALIST ACTIONS
  // =================================================================
  
  async initiatePayroll(createDto: CreatePayrollRunsDto, userRole: string) {
    if (userRole !== 'PAYROLL_SPECIALIST') {
      throw new ForbiddenException('Only Payroll Specialists can initiate payroll');
    }

    const period = (createDto as any).period;

    // Trigger Member B's Calculation (call only if method exists to satisfy TS)
    if (typeof (this.calculationService as any).calculateDraft === 'function') {
      await (this.calculationService as any).calculateDraft(period);
    }

    return {
      message: 'Payroll Initiated Successfully (Mock Data)',
      data: createDto,
      status: PayrollStatus.DRAFT,
      isLocked: false,
    };
  }

  // [THIS IS THE METHOD YOUR CONTROLLER WAS MISSING]
  async updatePayrollDraft(id: string, updateDto: UpdatePayrollRunsDto) {
    return {
      id,
      updatedFields: updateDto,
      status: PayrollStatus.DRAFT,
      message: 'Payroll Updated (Mock Data)'
    };
  }

  async submitForReview(id: string) {
    return {
      id,
      status: PayrollStatus.UNDER_REVIEW,
      message: 'Submitted for Review (Mock Data)'
    };
  }

  // =================================================================
  // 3. APPROVAL WORKFLOWS
  // =================================================================

  async managerReview(id: string, updateDto: UpdatePayrollRunsDto) {
    // Cast to any to safely access properties if they aren't strictly defined in DTO yet
    const approved = (updateDto as any).approved;
    const reason = (updateDto as any).reason;

    if (approved) {
      return { 
        id, 
        status: PayrollStatus.WAITING_FINANCE_APPROVAL, 
        message: 'Manager Approved (Mock Data)' 
      };
    } else {
      return { 
        id, 
        status: PayrollStatus.DRAFT, 
        rejectionReason: reason ?? null, 
        message: 'Manager Rejected (Mock Data)' 
      };
    }
  }

  async financeReview(id: string, updateDto: UpdatePayrollRunsDto) {
    const approved = (updateDto as any).approved;
    const reason = (updateDto as any).reason;

    if (approved) {
      return { 
        id, 
        status: PayrollStatus.PAID, 
        isLocked: true, 
        message: 'Finance Approved - Payroll Executed (Mock Data)' 
      };
    } else {
      return { 
        id, 
        status: PayrollStatus.DRAFT, 
        rejectionReason: reason ?? null, 
        message: 'Finance Rejected (Mock Data)' 
      };
    }
  }
}