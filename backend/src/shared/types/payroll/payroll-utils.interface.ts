// src for Pay Components, Tax, Insurance, and Penalty Rules (Building Blocks)

/** Used by IPayStructure to define base pay, fixed allowances, and deductions. */
export interface IPayComponent {
  name: string; // e.g., 'Transportation Allowance', 'Housing Allowance', 'Social Insurance Deduction'
  code: string; // e.g., 'ALW01', 'DED05'
  type: 'FIXED' | 'PERCENTAGE' | 'FORMULA'; // How the value is calculated
  value: number; // The amount or the rate/percentage
  taxable: boolean; // Is this component subject to income tax?
  isGrossAddition: boolean; // True for allowances, false for deductions
}

/** Defines the rules for statutory income tax. */
export interface ITaxRule {
  taxRuleId: string;
  countryCode: string;
  minIncome: number; // Lower bound of the tax bracket
  maxIncome: number | 'INF'; // Upper bound (use 'INF' for the highest bracket)
  taxRate: number; // Percentage (e.g., 0.15 for 15%)
  effectiveDate: Date;
}

/** Defines insurance/social security contribution brackets. */
export interface IInsuranceBracket {
  bracketId: string;
  minSalary: number;
  maxSalary: number;
  employeeRate: number; // Employee's contribution rate (%)
  companyRate: number; // Company's contribution rate (%)
}

/** Defines deductions for misconduct, lateness, or other non-statutory penalties. */
export interface IPenaltyRule {
  penaltyCode: string;
  name: string; // e.g., 'Excess Lateness Deduction', 'Misconduct Penalty'
  type: 'FIXED_AMOUNT' | 'PERCENTAGE_OF_BASE' | 'UNPAID_DAY_RATE';
  value: number; // The amount, rate, or number of days to deduct
  appliesTo: 'Lateness' | 'Misconduct' | 'Absenteeism';
}
