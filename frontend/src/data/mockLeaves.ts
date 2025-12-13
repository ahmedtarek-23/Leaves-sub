import { LeaveBalance, AccrualRecord, YearEndSummary } from '../types/leave';

const balances: LeaveBalance[] = [
  { leaveTypeCode: 'ANNUAL', leaveTypeName: 'Annual Leave', accrued: 24, taken: 5, remaining: 19 },
  { leaveTypeCode: 'SICK', leaveTypeName: 'Sick Leave', accrued: 10, taken: 2, remaining: 8 },
];

const accruals: AccrualRecord[] = [
  { date: new Date().toISOString(), leaveTypeCode: 'ANNUAL', leaveTypeName: 'Annual Leave', amount: 2, reason: 'Monthly accrual' },
  { date: new Date().toISOString(), leaveTypeCode: 'SICK', leaveTypeName: 'Sick Leave', amount: 1, reason: 'Monthly accrual' },
];

const yearEnd: YearEndSummary = {
  fiscalYear: new Date().getFullYear(),
  carriedForward: 10,
  expired: 5,
  notes: 'Auto carry-forward applied according to policy (max 10 days).'
};

export default { balances, accruals, yearEnd };
