import { LeaveBalance, AccrualRecord, YearEndResult } from '../types/leave';
import mockData from '../data/mockLeaves';

/**
 * Service layer for Leave Management
 * All functions are async to match backend-ready contracts
 */

export async function getLeaveBalances(): Promise<LeaveBalance[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockData.balances;
}

export async function getAccrualHistory(
  startDate?: string,
  endDate?: string,
  leaveTypeCode?: string
): Promise<AccrualRecord[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  let accruals = mockData.accruals;
  
  // Filter by date range if provided
  if (startDate || endDate) {
    accruals = accruals.filter(record => {
      const recordDate = new Date(record.date);
      if (startDate && recordDate < new Date(startDate)) return false;
      if (endDate && recordDate > new Date(endDate)) return false;
      return true;
    });
  }
  
  // Filter by leave type if provided
  if (leaveTypeCode) {
    accruals = accruals.filter(record => record.leaveTypeCode === leaveTypeCode);
  }
  
  return accruals;
}

export async function getYearEndResult(fiscalYear?: number): Promise<YearEndResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const year = fiscalYear || new Date().getFullYear();
  const result = mockData.yearEnd;
  
  // Calculate encashment if applicable
  if (result.encashmentDays && result.dailySalaryRate) {
    result.encashmentAmount = result.encashmentDays * result.dailySalaryRate;
  }
  
  return { ...result, fiscalYear: year };
}

export async function runYearEndProcessing(fiscalYear: number): Promise<YearEndResult> {
  // This would call the backend API in production
  // For now, return mock data
  await new Promise(resolve => setTimeout(resolve, 500));
  return getYearEndResult(fiscalYear);
}
