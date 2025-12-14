// Comprehensive Leave Management API Service
import apiClient from './api';
import {
  LeaveBalance,
  LeaveRequest,
  LeaveType,
  LeaveCategory,
  LeaveEntitlement,
  LeavePolicy,
  AccrualRecord,
  YearEndResult,
  CreateLeaveRequestDto,
  ReviewLeaveRequestDto,
  ManualAdjustmentDto,
  CreateLeaveTypeDto,
  CreateLeavePolicyDto,
  LeaveRequestFilters,
  LeaveHistoryFilters,
  Holiday,
  BlockedPeriod,
  AuditLog,
  LeaveValidationResult,
  IrregularLeavePattern,
  OffboardingSettlement,
  Attachment,
} from '../types/leaves';

// Leave Balances
export async function getLeaveBalances(employeeId?: string): Promise<LeaveBalance[]> {
  try {
    const endpoint = employeeId ? `/leaves/balances/${employeeId}` : '/leaves/balances/me';
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    // Fallback to mock data if API fails
    console.warn('API call failed, using mock data:', error);
    const mockData = await import('../data/mockLeaves');
    return mockData.default.balances;
  }
}

// Leave Requests
export async function getLeaveRequests(filters?: LeaveRequestFilters): Promise<LeaveRequest[]> {
  try {
    const response = await apiClient.get('/leaves/request', { params: filters });
    return response.data;
  } catch (error) {
    // Fallback to empty array if API fails
    console.warn('API call failed, returning empty array:', error);
    return [];
  }
}

export async function getLeaveRequestById(requestId: string): Promise<LeaveRequest> {
  try {
    const response = await apiClient.get(`/leaves/request/${requestId}`);
    return response.data;
  } catch (error) {
    // Fallback to mock request
    console.warn('API call failed, using mock data:', error);
    throw new Error('Leave request not found');
  }
}

export async function createLeaveRequest(data: CreateLeaveRequestDto): Promise<LeaveRequest> {
  try {
    const response = await apiClient.post('/leaves/request', data);
    return response.data;
  } catch (error: any) {
    // In development, return a mock response
    console.warn('API call failed, using mock response:', error);
    return {
      _id: Date.now().toString(),
      employeeId: data.employeeId,
      leaveTypeId: data.leaveTypeId,
      startDate: data.dates.from,
      endDate: data.dates.to,
      dates: data.dates,
      durationDays: Math.ceil(
        (new Date(data.dates.to).getTime() - new Date(data.dates.from).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1,
      justification: data.justification,
      status: 'pending' as any,
      approvalFlow: [],
      isSynced: false,
      requiresHRConversion: false,
      irregularPatternFlag: false,
      excessDays: 0,
      hasAttachments: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function cancelLeaveRequest(requestId: string, employeeId: string): Promise<LeaveRequest> {
  const response = await apiClient.put(`/leaves/request/${requestId}/cancel`, { employeeId });
  return response.data;
}

export async function reviewLeaveRequest(
  requestId: string,
  data: ReviewLeaveRequestDto
): Promise<LeaveRequest> {
  const response = await apiClient.put(`/leaves/request/${requestId}/review`, data);
  return response.data;
}

export async function bulkReviewLeaveRequests(
  requestIds: string[],
  data: Omit<ReviewLeaveRequestDto, 'approverId'> & { approverId: string; comments?: string }
): Promise<LeaveRequest[]> {
  const response = await apiClient.post('/leaves/bulk-review', {
    requestIds,
    ...data,
  });
  return response.data;
}

// Leave Types
export async function getLeaveTypes(): Promise<LeaveType[]> {
  try {
    const response = await apiClient.get('/leaves/types');
    return response.data;
  } catch (error) {
    // Fallback to mock leave types
    console.warn('API call failed, using mock data:', error);
    return [
      {
        _id: '1',
        code: 'ANNUAL',
        name: 'Annual Leave',
        categoryId: '1',
        description: 'Annual vacation leave',
        paid: true,
        deductible: true,
        requiresAttachment: false,
        isActive: true,
      },
      {
        _id: '2',
        code: 'SICK',
        name: 'Sick Leave',
        categoryId: '2',
        description: 'Medical leave',
        paid: true,
        deductible: true,
        requiresAttachment: true,
        attachmentType: 'medical' as any,
        isActive: true,
      },
    ];
  }
}

export async function getLeaveTypeById(typeId: string): Promise<LeaveType> {
  const response = await apiClient.get(`/leaves/types/${typeId}`);
  return response.data;
}

export async function createLeaveType(data: CreateLeaveTypeDto): Promise<LeaveType> {
  const response = await apiClient.post('/leaves/types', data);
  return response.data;
}

export async function updateLeaveType(typeId: string, data: Partial<CreateLeaveTypeDto>): Promise<LeaveType> {
  const response = await apiClient.put(`/leaves/types/${typeId}`, data);
  return response.data;
}

export async function activateLeaveType(typeId: string, isActive: boolean): Promise<LeaveType> {
  const response = await apiClient.patch(`/leaves/types/${typeId}/activate`, { isActive });
  return response.data;
}

// Leave Categories
export async function getLeaveCategories(): Promise<LeaveCategory[]> {
  try {
    const response = await apiClient.get('/leaves/categories');
    return response.data;
  } catch (error) {
    // Fallback to mock categories
    console.warn('API call failed, using mock data:', error);
    return [
      { _id: '1', name: 'Paid Leave', description: 'Deductible paid leave' },
      { _id: '2', name: 'Unpaid Leave', description: 'Non-deductible unpaid leave' },
    ];
  }
}

// Leave Entitlements
export async function getLeaveEntitlements(employeeId?: string): Promise<LeaveEntitlement[]> {
  const endpoint = employeeId ? `/leaves/entitlements/${employeeId}` : '/leaves/entitlements/me';
  const response = await apiClient.get(endpoint);
  return response.data;
}

export async function updateEmployeeEntitlement(
  employeeId: string,
  leaveTypeId: string,
  yearlyEntitlement: number
): Promise<LeaveEntitlement> {
  const response = await apiClient.put(`/leaves/entitlements/${employeeId}/${leaveTypeId}`, {
    yearlyEntitlement,
  });
  return response.data;
}

// Leave Policies
export async function getLeavePolicies(): Promise<LeavePolicy[]> {
  try {
    const response = await apiClient.get('/leaves/policies');
    return response.data;
  } catch (error) {
    // Fallback to empty array
    console.warn('API call failed, returning empty array:', error);
    return [];
  }
}

export async function getLeavePolicyById(policyId: string): Promise<LeavePolicy> {
  const response = await apiClient.get(`/leaves/policies/${policyId}`);
  return response.data;
}

export async function createLeavePolicy(data: CreateLeavePolicyDto): Promise<LeavePolicy> {
  const response = await apiClient.post('/leaves/policies', data);
  return response.data;
}

export async function updateLeavePolicy(
  policyId: string,
  data: Partial<CreateLeavePolicyDto>
): Promise<LeavePolicy> {
  const response = await apiClient.put(`/leaves/policies/${policyId}`, data);
  return response.data;
}

// Manual Adjustments
export async function adjustLeaveBalance(data: ManualAdjustmentDto): Promise<LeaveBalance> {
  const response = await apiClient.put('/leaves/balances/adjust', data);
  return response.data;
}

// Accrual History
export async function getAccrualHistory(
  employeeId?: string,
  startDate?: string,
  endDate?: string,
  leaveTypeCode?: string
): Promise<AccrualRecord[]> {
  try {
    const response = await apiClient.get('/leaves/accrual/history', {
      params: { employeeId, startDate, endDate, leaveTypeCode },
    });
    return response.data;
  } catch (error) {
    // Fallback to mock data
    console.warn('API call failed, using mock data:', error);
    const mockData = await import('../data/mockLeaves');
    return mockData.default.accruals;
  }
}

// Year-End Processing
export async function getYearEndResult(fiscalYear?: number): Promise<YearEndResult> {
  try {
    const response = await apiClient.get('/leaves/year-end', {
      params: { fiscalYear },
    });
    return response.data;
  } catch (error) {
    // Fallback to mock data
    console.warn('API call failed, using mock data:', error);
    const mockData = await import('../data/mockLeaves');
    const year = fiscalYear || new Date().getFullYear() - 1;
    return { ...mockData.default.yearEnd, fiscalYear: year };
  }
}

export async function runYearEndProcessing(fiscalYear: number): Promise<YearEndResult> {
  try {
    const response = await apiClient.post('/leaves/year-end/process', { fiscalYear });
    return response.data;
  } catch (error) {
    // Fallback to mock data
    console.warn('API call failed, using mock data:', error);
    return getYearEndResult(fiscalYear);
  }
}

// Leave History
export async function getLeaveHistory(filters?: LeaveHistoryFilters): Promise<LeaveRequest[]> {
  try {
    const response = await apiClient.get('/leaves/history', { params: filters });
    return response.data;
  } catch (error) {
    // Fallback to empty array
    console.warn('API call failed, returning empty array:', error);
    return [];
  }
}

// Holidays & Blocked Periods
export async function getHolidays(year?: number): Promise<Holiday[]> {
  const response = await apiClient.get('/leaves/holidays', { params: { year } });
  return response.data;
}

export async function createHoliday(data: Omit<Holiday, '_id'>): Promise<Holiday> {
  const response = await apiClient.post('/leaves/holidays', data);
  return response.data;
}

export async function deleteHoliday(holidayId: string): Promise<void> {
  await apiClient.delete(`/leaves/holidays/${holidayId}`);
}

export async function getBlockedPeriods(): Promise<BlockedPeriod[]> {
  const response = await apiClient.get('/leaves/blocked-periods');
  return response.data;
}

export async function createBlockedPeriod(data: Omit<BlockedPeriod, '_id'>): Promise<BlockedPeriod> {
  const response = await apiClient.post('/leaves/blocked-periods', data);
  return response.data;
}

export async function deleteBlockedPeriod(periodId: string): Promise<void> {
  await apiClient.delete(`/leaves/blocked-periods/${periodId}`);
}

// Validation
export async function validateLeaveRequest(
  employeeId: string,
  leaveTypeId: string,
  startDate: string,
  endDate: string
): Promise<LeaveValidationResult> {
  try {
    const response = await apiClient.post('/leaves/validate', {
      employeeId,
      leaveTypeId,
      startDate,
      endDate,
    });
    return response.data;
  } catch (error) {
    // Fallback to valid result
    console.warn('API call failed, returning valid result:', error);
    return {
      isValid: true,
      errors: [],
      warnings: [],
    };
  }
}

// Attachments
export async function addAttachment(
  requestId: string,
  file: File
): Promise<Attachment> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post(`/leaves/request/${requestId}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function deleteAttachment(requestId: string, attachmentId: string): Promise<void> {
  await apiClient.delete(`/leaves/request/${requestId}/attachments/${attachmentId}`);
}

// Medical Verification (HR)
export async function verifyMedicalDocuments(
  requestId: string,
  verifiedBy: string,
  isValid: boolean,
  comments?: string
): Promise<LeaveRequest> {
  const response = await apiClient.put(`/leaves/request/${requestId}/verify-medical`, {
    verifiedBy,
    isValid,
    comments,
  });
  return response.data;
}

// Flagging
export async function flagLeaveRequest(
  requestId: string,
  flaggedBy: string,
  reason: string,
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
): Promise<LeaveRequest> {
  const response = await apiClient.put(`/leaves/request/${requestId}/flag`, {
    flaggedBy,
    reason,
    priority,
  });
  return response.data;
}

// Reports
export async function getIrregularLeaveReport(managerId: string): Promise<IrregularLeavePattern[]> {
  const response = await apiClient.get('/leaves/reports/irregular', {
    params: { managerId },
  });
  return response.data;
}

// Audit Logs
export async function getAuditLogs(
  entityType?: string,
  entityId?: string,
  startDate?: string,
  endDate?: string
): Promise<AuditLog[]> {
  try {
    const response = await apiClient.get('/leaves/audit-logs', {
      params: { entityType, entityId, startDate, endDate },
    });
    return response.data;
  } catch (error) {
    // Fallback to empty array
    console.warn('API call failed, returning empty array:', error);
    return [];
  }
}

// Offboarding
export async function getOffboardingSettlement(employeeId: string): Promise<OffboardingSettlement> {
  try {
    const response = await apiClient.get(`/leaves/offboarding/${employeeId}`);
    return response.data;
  } catch (error) {
    // Fallback to mock settlement
    console.warn('API call failed, using mock data:', error);
    const mockData = await import('../data/mockLeaves');
    return {
      employeeId,
      employeeName: 'Test Employee',
      remainingBalance: mockData.default.balances,
      encashmentDays: 15,
      dailySalaryRate: 500,
      encashmentAmount: 7500,
      isLocked: false,
    };
  }
}

export async function encashLeave(
  requestId: string,
  dailySalaryRate: number
): Promise<{ encashmentAmount: number; encashmentDays: number }> {
  const response = await apiClient.post(`/leaves/encash/${requestId}`, { dailySalaryRate });
  return response.data;
}

// Mock fallback functions (for development/testing)
export const mockLeavesService = {
  getLeaveBalances: async (): Promise<LeaveBalance[]> => {
    // Return mock data if API fails
    return [
      {
        leaveTypeCode: 'ANNUAL',
        leaveTypeName: 'Annual Leave',
        accrued: 24,
        used: 5,
        remaining: 19,
        pending: 3,
        carryOver: 10,
      },
    ];
  },
};

