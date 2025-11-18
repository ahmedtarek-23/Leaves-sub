import { Document } from 'mongoose';
import {
  ITaxRule,
  IInsuranceBracket,
  IPenaltyRule,
} from './payroll-utils.interface';

/**
 * Interface for the core company-wide Payroll Configuration and Policy Setup.
 * This document acts as the single source of truth for all statutory and corporate payroll rules.
 */
export interface IConfigPolicy extends Document {
  policyCode: string; // Unique code (e.g., 'EGY_2025_STANDARD')
  isActive: boolean; // True if this policy set is currently active
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ARCHIVED';

  // --- Phase 2: Embed Compliance ---
  taxRules: ITaxRule[]; // Array of statutory tax brackets/rules (managed by Legal Admin)
  insuranceBrackets: IInsuranceBracket[]; // Array of insurance/social security brackets (managed by HR Manager)

  // --- Phase 1: Define Structure (General Rules) ---
  misconductPenalties: IPenaltyRule[]; // Penalties for short time/misconduct (managed by Payroll Specialist)

  // System-wide settings
  payFrequency: 'MONTHLY' | 'WEEKLY' | 'BI_WEEKLY';
  payDate: number; // Day of the month for payment (e.g., 25)

  // Audit and Approval
  configuredByUserId: string;
  lastApprovedByUserId: string;
  approvedDate: Date;
}
