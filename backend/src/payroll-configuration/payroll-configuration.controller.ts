import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import { PayrollConfigurationService } from './payroll-configuration.service';
import { Request } from 'express';

// --- Auth Imports ---
import { Permissions } from '../auth/decorators/roles.decorators';
import { Permission } from '../auth/permissions.constant';
import { AuthUser } from '../auth/auth-user.interface';
import { Public } from '../auth/decorators/roles.decorators';

// --- DTOs (Create & Update) ---
import { CreateAllowanceDto } from './dto/create-allowance.dto';
import { UpdateAllowanceDto } from './dto/update-allowance.dto';

import { CreateTaxRuleDto } from './dto/create-tax-rule.dto';
import { UpdateTaxRuleDto } from './dto/update-tax-rule.dto';

import { CreateInsuranceDto } from './dto/create-insurance.dto';
import { UpdateInsuranceDto } from './dto/update-insurance.dto';

import { CreateSigningBonusDto } from './dto/create-signing-bonus.dto';
import { UpdateSigningBonusDto } from './dto/update-signing-bonus.dto';

import { CreateCompanySettingsDto } from './dto/create-company-settings.dto';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';

import { CreatePayGradeDto } from './dto/create-pay-grade.dto';
import { UpdatePayGradeDto } from './dto/update-pay-grade.dto';

import { CreatePayTypeDto } from './dto/create-pay-type.dto';
import { UpdatePayTypeDto } from './dto/update-pay-type.dto';

import { CreatePayrollPoliciesDto } from './dto/create-payroll-policies.dto';
import { UpdatePayrollPoliciesDto } from './dto/update-payroll-policies.dto';

import { CreateTerminationBenefitsDto } from './dto/create-termination-benefits.dto';
import { UpdateTerminationBenefitsDto } from './dto/update-termination-benefits.dto';

import { ChangeStatusDto } from './dto/change-status.dto';

@Controller('payroll-config')
export class PayrollConfigurationController {
  constructor(private readonly configService: PayrollConfigurationService) {}

  // ===========================================================================
  // 1. Company Wide Settings
  // ===========================================================================
  
  @Post('settings')
  @Permissions(Permission.MANAGE_PAYROLL)
  createSettings(@Body() dto: CreateCompanySettingsDto) { 
    return this.configService.createSettings(dto); 
  }

  @Put('settings')
  @Permissions(Permission.MANAGE_PAYROLL)
  updateSettings(@Body() dto: UpdateCompanySettingsDto) { 
    return this.configService.updateSettings(dto); 
  }
  
  @Get('settings')
  @Permissions(Permission.MANAGE_PAYROLL)
  getSettings() { return this.configService.getSettings(); }


  // ===========================================================================
  // 2. Pay Grades
  // ===========================================================================

  @Post('pay-grades')
  @Permissions(Permission.MANAGE_PAYROLL, Permission.MANAGE_ALL_PROFILES)
  createPayGrade(@Body() dto: CreatePayGradeDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.createPayGrade(dto, req.user);
  }
  
  @Put('pay-grades/:id')
  @Permissions(Permission.MANAGE_PAYROLL, Permission.MANAGE_ALL_PROFILES)
  updatePayGrade(@Param('id') id: string, @Body() dto: UpdatePayGradeDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.updatePayGrade(id, dto, req.user);
  }

  @Get('pay-grades')
  @Public()
  getPayGrades() { return this.configService.getPayGrades(); }

  @Get('pay-grades/:id')
  @Public()
  getPayGradeById(@Param('id') id: string) {
    return this.configService.getPayGradeById(id);
  }
  
  @Patch('pay-grades/:id/status')
  @Permissions(Permission.MANAGE_PAYROLL, Permission.APPROVE_PAYROLL)
  changePayGradeStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.changePayGradeStatus(id, dto, req.user);
  }

  @Delete('pay-grades/:id')
  @Permissions(Permission.MANAGE_PAYROLL)
  deletePayGrade(@Param('id') id: string, @Req() req: Request & { user: AuthUser }) {
    return this.configService.deletePayGrade(id, req.user);
  }


  // ===========================================================================
  // 3. Payroll Policies
  // ===========================================================================

  @Post('policies')
  @Permissions(Permission.MANAGE_PAYROLL)
  createPayrollPolicy(@Body() dto: CreatePayrollPoliciesDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.createPayrollPolicy(dto, req.user);
  }

  @Put('policies/:id')
  @Permissions(Permission.MANAGE_PAYROLL)
  updatePayrollPolicy(@Param('id') id: string, @Body() dto: UpdatePayrollPoliciesDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.updatePayrollPolicy(id, dto, req.user);
  }

  @Get('policies')
  @Public()
  getPayrollPolicies() { return this.configService.getPayrollPolicies(); }

  @Get('policies/:id')
  @Public()
  getPayrollPolicyById(@Param('id') id: string) {
    return this.configService.getPayrollPolicyById(id);
  }
  
  @Patch('policies/:id/status')
  @Permissions(Permission.APPROVE_PAYROLL) // Higher approval for core policies
  changePayrollPolicyStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.changePayrollPolicyStatus(id, dto, req.user);
  }

  @Delete('policies/:id')
  @Permissions(Permission.MANAGE_PAYROLL)
  deletePayrollPolicy(@Param('id') id: string, @Req() req: Request & { user: AuthUser }) {
    return this.configService.deletePayrollPolicy(id, req.user);
  }

  // ===========================================================================
  // 4. Tax Rules
  // ===========================================================================

  @Post('tax-rules')
  @Permissions(Permission.MANAGE_PAYROLL)
  createTaxRule(@Body() dto: CreateTaxRuleDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.createTaxRule(dto, req.user);
  }

  @Put('tax-rules/:id')
  @Permissions(Permission.MANAGE_PAYROLL)
  updateTaxRule(@Param('id') id: string, @Body() dto: UpdateTaxRuleDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.updateTaxRule(id, dto, req.user);
  }

  @Get('tax-rules')
  @Public()
  getTaxRules() { return this.configService.getTaxRules(); }

  @Get('tax-rules/:id')
  @Public()
  getTaxRuleById(@Param('id') id: string) {
    return this.configService.getTaxRuleById(id);
  }

  @Patch('tax-rules/:id/status')
  @Permissions(Permission.MANAGE_PAYROLL)
  changeTaxStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.approveTaxRule(id, dto, req.user);
  }

  @Delete('tax-rules/:id')
  @Permissions(Permission.MANAGE_PAYROLL)
  deleteTaxRule(@Param('id') id: string, @Req() req: Request & { user: AuthUser }) {
    return this.configService.deleteTaxRule(id, req.user);
  }

  // ===========================================================================
  // 5. Insurance
  // ===========================================================================

  @Post('insurance')
  @Permissions(Permission.MANAGE_PAYROLL)
  createInsurance(@Body() dto: CreateInsuranceDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.createInsurance(dto, req.user);
  }

  @Put('insurance/:id')
  @Permissions(Permission.MANAGE_PAYROLL)
  updateInsurance(@Param('id') id: string, @Body() dto: UpdateInsuranceDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.updateInsurance(id, dto, req.user);
  }

  @Get('insurance/:id')
  @Public()
  getInsuranceById(@Param('id') id: string) {
    return this.configService.getInsuranceById(id);
  }

  @Get('insurance')
  @Public()
  getInsurance() { return this.configService.getInsuranceBrackets(); }

  @Patch('insurance/:id/status')
  @Permissions(Permission.APPROVE_PAYROLL)  // Higher approval required for insurance (financial/legal sensitivity)
  changeInsuranceStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.approveInsurance(id, dto, req.user);
  }


  // ===========================================================================
  // 6. Allowances
  // ===========================================================================

  @Post('allowances')
  @Permissions(Permission.MANAGE_PAYROLL)
  createAllowance(@Body() dto: CreateAllowanceDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.createAllowance(dto, req.user);
  }
  
  @Put('allowances/:id')
  @Permissions(Permission.MANAGE_PAYROLL)
  updateAllowance(@Param('id') id: string, @Body() dto: UpdateAllowanceDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.updateAllowance(id, dto, req.user);
  }

  @Get('allowances')
  @Public()
  getAllowances() { return this.configService.getAllowances(); }

  @Get('allowances/:id')
  @Public()
  getAllowanceById(@Param('id') id: string) {
    return this.configService.getAllowanceById(id);
  }

  @Patch('allowances/:id/status')
  @Permissions(Permission.MANAGE_PAYROLL)
  changeAllowanceStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.approveAllowance(id, dto, req.user);
  }

  @Delete('allowances/:id')
  @Permissions(Permission.MANAGE_PAYROLL)
  deleteAllowance(@Param('id') id: string, @Req() req: Request & { user: AuthUser }) {
    return this.configService.deleteAllowance(id, req.user);
  }

  // ===========================================================================
  // 7. Pay Types
  // ===========================================================================

  @Post('pay-types')
  @Permissions(Permission.MANAGE_PAYROLL)
  createPayType(@Body() dto: CreatePayTypeDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.createPayType(dto, req.user);
  }

  @Put('pay-types/:id')
  @Permissions(Permission.MANAGE_PAYROLL)
  updatePayType(@Param('id') id: string, @Body() dto: UpdatePayTypeDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.updatePayType(id, dto, req.user);
  }

  @Get('pay-types')
  @Public()
  getPayTypes() { return this.configService.getPayTypes(); }

  @Get('pay-types/:id')
  @Public()
  getPayTypeById(@Param('id') id: string) {
    return this.configService.getPayTypeById(id);
  }

  @Patch('pay-types/:id/status')
  @Permissions(Permission.MANAGE_PAYROLL)
  changePayTypeStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.approvePayType(id, dto, req.user);
  }

  @Delete('pay-types/:id')
  @Permissions(Permission.MANAGE_PAYROLL)
  deletePayType(@Param('id') id: string, @Req() req: Request & { user: AuthUser }) {
    return this.configService.deletePayType(id, req.user);
  }

  // ===========================================================================
  // 8. Signing Bonuses
  // ===========================================================================

  @Post('signing-bonuses')
  @Permissions(Permission.MANAGE_PAYROLL, Permission.MANAGE_RECRUITMENT)
  createSigningBonus(@Body() dto: CreateSigningBonusDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.createSigningBonus(dto, req.user);
  }

  @Put('signing-bonuses/:id')
  @Permissions(Permission.MANAGE_PAYROLL)
  updateSigningBonus(@Param('id') id: string, @Body() dto: UpdateSigningBonusDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.updateSigningBonus(id, dto, req.user);
  }

  @Get('signing-bonuses')
  @Public()
  getSigningBonuses() { return this.configService.getSigningBonuses(); }

  @Get('signing-bonuses/:id')
  @Public()
  getSigningBonusById(@Param('id') id: string) {
    return this.configService.getSigningBonusById(id);
  }

  @Patch('signing-bonuses/:id/status')
  @Permissions(Permission.MANAGE_PAYROLL)
  changeBonusStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.approveSigningBonus(id, dto, req.user);
  }

  @Delete('signing-bonuses/:id')
  @Permissions(Permission.MANAGE_PAYROLL)
  deleteSigningBonus(@Param('id') id: string, @Req() req: Request & { user: AuthUser }) {
    return this.configService.deleteSigningBonus(id, req.user);
  }

  // ===========================================================================
  // 9. Termination Benefits
  // ===========================================================================

  @Post('termination-benefits')
  @Permissions(Permission.MANAGE_PAYROLL)
  createTermination(@Body() dto: CreateTerminationBenefitsDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.createTerminationBenefit(dto, req.user);
  }

  @Put('termination-benefits/:id')
  @Permissions(Permission.MANAGE_PAYROLL)
  updateTermination(@Param('id') id: string, @Body() dto: UpdateTerminationBenefitsDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.updateTerminationBenefit(id, dto, req.user);
  }

  @Get('termination-benefits')
  @Public()
  getTerminationBenefits() { return this.configService.getTerminationBenefits(); }

  @Get('termination-benefits/:id')
  @Public()
  getTerminationBenefitById(@Param('id') id: string) {
    return this.configService.getTerminationBenefitById(id);
  }
  
  @Patch('termination-benefits/:id/status')
  @Permissions(Permission.MANAGE_PAYROLL)
  changeTermStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.approveTerminationBenefit(id, dto, req.user);
  }

  @Delete('termination-benefits/:id')
  @Permissions(Permission.MANAGE_PAYROLL)
  deleteTerminationBenefit(@Param('id') id: string, @Req() req: Request & { user: AuthUser }) {
    return this.configService.deleteTerminationBenefit(id, req.user);
  }
}