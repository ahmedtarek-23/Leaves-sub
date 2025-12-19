// Type definitions for payroll configuration

export enum ConfigStatus {
  DRAFT = 'draft',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum PolicyType {
  DEDUCTION = 'Deduction',
  ALLOWANCE = 'Allowance',
  BENEFIT = 'Benefit',
  MISCONDUCT = 'Misconduct',
  LEAVE = 'Leave',
}

export enum Applicability {
  AllEmployees = 'All Employees',
  FULL_TIME = 'Full Time Employees',
  PART_TIME = 'Part Time Employees',
  CONTRACTORS = 'Contractors',
}

// Company Settings
export interface CompanySettings {
  _id?: string;
  payDate: string;
  timeZone: string;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompanySettingsDto {
  payDate: string;
  timeZone: string;
  currency?: string;
}

export interface UpdateCompanySettingsDto {
  payDate?: string;
  timeZone?: string;
  currency?: string;
}

// Pay Grades
export interface PayGrade {
  _id: string;
  grade: string;
  baseSalary: number;
  grossSalary: number;
  departmentId?: string;
  positionId?: string;
  status: ConfigStatus;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePayGradeDto {
  grade: string;
  baseSalary: number;
  grossSalary: number;
  departmentId?: string;
  positionId?: string;
}

export interface UpdatePayGradeDto {
  grade?: string;
  baseSalary?: number;
  grossSalary?: number;
  departmentId?: string;
  positionId?: string;
}

// Payroll Policies
export interface RuleDefinition {
  percentage: number;
  fixedAmount: number;
  thresholdAmount: number;
}

export interface PayrollPolicy {
  _id: string;
  policyName: string;
  policyType: PolicyType;
  description: string;
  effectiveDate: string;
  ruleDefinition: RuleDefinition;
  applicability: Applicability;
  status: ConfigStatus;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePayrollPolicyDto {
  policyName: string;
  policyType: PolicyType;
  description: string;
  effectiveDate: string;
  ruleDefinition: RuleDefinition;
  applicability: Applicability;
}

export interface UpdatePayrollPolicyDto {
  policyName?: string;
  policyType?: PolicyType;
  description?: string;
  effectiveDate?: string;
  ruleDefinition?: RuleDefinition;
  applicability?: Applicability;
}

// Tax Rules
export interface TaxRule {
  _id: string;
  name: string;
  description?: string;
  rate: number;
  status: ConfigStatus;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaxRuleDto {
  name: string;
  description?: string;
  rate: number;
}

export interface UpdateTaxRuleDto {
  name?: string;
  description?: string;
  rate?: number;
}

// Insurance Brackets
export interface InsuranceBracket {
  _id: string;
  name: string;
  minSalary: number;
  maxSalary: number;
  employeeRate: number;
  employerRate: number;
  status: ConfigStatus;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInsuranceDto {
  name: string;
  minSalary: number;
  maxSalary: number;
  employeeRate: number;
  employerRate: number;
}

export interface UpdateInsuranceDto {
  name?: string;
  minSalary?: number;
  maxSalary?: number;
  employeeRate?: number;
  employerRate?: number;
}

// Allowances
export interface Allowance {
  _id: string;
  name: string;
  amount: number;
  status: ConfigStatus;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAllowanceDto {
  name: string;
  amount: number;
}

export interface UpdateAllowanceDto {
  name?: string;
  amount?: number;
}

// Pay Types
export interface PayType {
  _id: string;
  type: string;
  amount: number;
  status: ConfigStatus;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePayTypeDto {
  type: string;
  amount: number;
}

export interface UpdatePayTypeDto {
  type?: string;
  amount?: number;
}

// Signing Bonuses
export interface SigningBonus {
  _id: string;
  positionName: string;
  amount: number;
  status: ConfigStatus;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSigningBonusDto {
  positionName: string;
  amount: number;
}

export interface UpdateSigningBonusDto {
  positionName?: string;
  amount?: number;
}

// Termination Benefits
export interface TerminationBenefit {
  _id: string;
  name: string;
  amount: number;
  terms?: string;
  status: ConfigStatus;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTerminationBenefitDto {
  name: string;
  amount: number;
  terms?: string;
}

export interface UpdateTerminationBenefitDto {
  name?: string;
  amount?: number;
  terms?: string;
}

// Status Change
export interface ChangeStatusDto {
  status: ConfigStatus;
  rejectionReason?: string;
}

