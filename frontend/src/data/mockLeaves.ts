import { LeaveBalance, AccrualRecord, YearEndResult } from '../types/leave';

const balances: LeaveBalance[] = [
  { 
    leaveTypeCode: 'ANNUAL', 
    leaveTypeName: 'Annual Leave', 
    accrued: 24, 
    used: 5, 
    remaining: 19,
    pending: 3,
    carryOver: 10
  },
  { 
    leaveTypeCode: 'SICK', 
    leaveTypeName: 'Sick Leave', 
    accrued: 10, 
    used: 2, 
    remaining: 8,
    pending: 0,
    carryOver: 0
  },
  {
    leaveTypeCode: 'CASUAL',
    leaveTypeName: 'Casual Leave',
    accrued: 7,
    used: 1,
    remaining: 6,
    pending: 1,
    carryOver: 0
  }
];

const accruals: AccrualRecord[] = [
  { 
    id: '1',
    date: new Date(2025, 0, 1).toISOString(), 
    leaveTypeCode: 'ANNUAL', 
    leaveTypeName: 'Annual Leave', 
    amount: 2, 
    reason: 'Monthly accrual',
    adjustmentType: 'automatic'
  },
  { 
    id: '2',
    date: new Date(2025, 0, 1).toISOString(), 
    leaveTypeCode: 'SICK', 
    leaveTypeName: 'Sick Leave', 
    amount: 1, 
    reason: 'Monthly accrual',
    adjustmentType: 'automatic'
  },
  {
    id: '3',
    date: new Date(2024, 11, 15).toISOString(),
    leaveTypeCode: 'ANNUAL',
    leaveTypeName: 'Annual Leave',
    amount: 5,
    reason: 'Manual adjustment - Year-end correction',
    adjustmentType: 'manual',
    adjustedBy: 'HR Admin'
  },
  {
    id: '4',
    date: new Date(2024, 10, 1).toISOString(),
    leaveTypeCode: 'ANNUAL',
    leaveTypeName: 'Annual Leave',
    amount: 2,
    reason: 'Monthly accrual',
    adjustmentType: 'automatic'
  },
  {
    id: '5',
    date: new Date(2024, 9, 1).toISOString(),
    leaveTypeCode: 'ANNUAL',
    leaveTypeName: 'Annual Leave',
    amount: 2,
    reason: 'Monthly accrual',
    adjustmentType: 'automatic'
  }
];

const yearEnd: YearEndResult = {
  fiscalYear: new Date().getFullYear() - 1,
  carriedForward: 10,
  expired: 5,
  encashmentDays: 15,
  dailySalaryRate: 500,
  encashmentAmount: 7500, // 15 days * 500 (capped at 30 days per policy)
  notes: 'Auto carry-forward applied according to policy (max 10 days). Remaining unused days eligible for encashment (capped at 30 days).'
};

export default { balances, accruals, yearEnd };
