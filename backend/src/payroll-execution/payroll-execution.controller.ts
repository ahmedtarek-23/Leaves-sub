import { Controller, Post, Patch, Get, Body, Param, Request, UseGuards } from '@nestjs/common';
import { PayrollExecutionService } from './payroll-execution.service';

// Import DTOs
import { CreatePayrollRunsDto } from './dto/create-payroll-runs.dto'; 
import { UpdatePayrollRunsDto } from './dto/update-payroll-runs.dto';

// Import Auth Guards & Decorators
import { Permissions } from '../auth/decorators/roles.decorators';
import { Permission } from '../auth/permissions.constant';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('payroll-execution')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayrollExecutionController {
  constructor(private payrollService: PayrollExecutionService) {}

  // =================================================================
  // 1. VIEWING DATA
  // =================================================================
  
  // Get Details by ID
  @Get(':id')
  @Permissions(Permission.MANAGE_PAYROLL, Permission.APPROVE_PAYROLL, Permission.VIEW_OWN_PAYSLIP)
  async getPayrollById(@Param('id') id: string) {
    return this.payrollService.getPayrollById(id);
  }

  // =================================================================
  // 2. SPECIALIST ACTIONS
  // =================================================================

  // Phase 1: Initiation
  @Post('initiate')
  @Permissions(Permission.MANAGE_PAYROLL)
  async initiatePayroll(@Body() body: CreatePayrollRunsDto, @Request() req) {
    // Requires body to have 'period'. ensure CreatePayrollRunsDto has this field.
    // Use a type cast to avoid TypeScript error until the DTO is updated to include 'period'.
    return this.payrollService.initiatePayroll((body as any).period, req.user.role);
  }

  // Manual Edit/Update (Phase 1 / Correction)
  @Patch(':id')
  @Permissions(Permission.MANAGE_PAYROLL)
  async updatePayroll(@Param('id') id: string, @Body() body: UpdatePayrollRunsDto) {
    return this.payrollService.updatePayrollDraft(id, body);
  }

  // Phase 3: Submit for Manager Review
  @Patch(':id/submit-review')
  @Permissions(Permission.MANAGE_PAYROLL)
  async submitForReview(@Param('id') id: string) {
    return this.payrollService.submitForReview(id);
  }

  // =================================================================
  // 3. APPROVAL WORKFLOWS
  // =================================================================

  // Phase 3: Manager Approval
  @Patch(':id/manager-review')
  @Permissions(Permission.APPROVE_PAYROLL)
  async managerReview(@Param('id') id: string, @Body() body: UpdatePayrollRunsDto) {
    return this.payrollService.managerReview(id, body);
  }

  // Phase 3/5: Finance Approval
  @Patch(':id/finance-review')
  @Permissions(Permission.APPROVE_PAYROLL)
  async financeReview(@Param('id') id: string, @Body() body: UpdatePayrollRunsDto) {
    return this.payrollService.financeReview(id, body);
  }
}