import { Types } from 'mongoose';

// We DO NOT extend EmployeeProfile to avoid required fields
export interface MockEmployee {
  _id: Types.ObjectId | string;

  baseSalary?: number;

  mockAllowances?: { amount: number }[];
  mockTaxes?: { rate: number }[];
  mockInsurances?: { employeeRate: number; minSalary: number; maxSalary: number; amount: number }[];
  mockPenalties?: number;
  mockBenefits?: number;

  mockBankAccountNumber?: string;
}

export const mockEmployees: MockEmployee[] = [
  {
    _id: new Types.ObjectId(),

    baseSalary: 8000,

    mockAllowances: [
      { amount: 500 },
      { amount: 250 },
    ],

    mockTaxes: [
      { rate: 10 },
    ],

    mockInsurances: [
      {
        employeeRate: 5,
        minSalary: 0,
        maxSalary: 100000,
        amount: 0,
      },
    ],

    mockPenalties: 0,
    mockBenefits: 1200,

    mockBankAccountNumber: '1234567890',
  },

  {
    _id: new Types.ObjectId(),

    baseSalary: 6500,

    mockAllowances: [
      { amount: 300 },
    ],

    mockTaxes: [
      { rate: 8 },
    ],

    mockInsurances: [
      {
        employeeRate: 4,
        minSalary: 0,
        maxSalary: 100000,
        amount: 0,
      },
    ],

    mockPenalties: 200,
    mockBenefits: 0,

    mockBankAccountNumber: '', // triggers anomaly
  },
];
