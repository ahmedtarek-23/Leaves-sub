import api from "@/lib/api";
import {
    LeaveType,
    LeavePolicy,
    LeaveEntitlement,
    LeaveRequest,
    CreateLeaveTypeDto,
    CreatePolicyDto,
    CreateEntitlementDto,
    CreateLeaveRequestDto,
    ListRequestsFilterDto,
    ManualAdjustmentDto,
    LeaveStatus,
} from "@/types/leaves";

export const leavesService = {
    // Types
    createType: async (data: CreateLeaveTypeDto) => {
        try {
            console.log("🚀 Creating leave type:", data);
            console.log("📍 Token exists:", !!localStorage.getItem("access_token"));
            console.log("📡 API BaseURL:", api.defaults.baseURL);
            const res = await api.post<LeaveType>("/leaves/types", data);
            console.log("✅ Leave type created:", res.data);
            return res.data;
        } catch (error: any) {
            console.error("❌ Create type error:", {
                status: error.response?.status,
                statusText: error.response?.statusText,
                url: error.config?.url,
                baseURL: error.config?.baseURL,
                method: error.config?.method,
                message: error.message,
                responseData: error.response?.data,
                fullError: error,
            });
            throw error;
        }
    },
    listCategories: async () => {
        try {
            console.log("📋 Fetching leave categories");
            const res = await api.get("/leaves/categories");
            console.log("✅ Leave categories fetched:", res.data);
            return res.data;
        } catch (error: any) {
            console.error("❌ List categories error:", {
                status: error.response?.status,
                message: error.message,
            });
            throw error;
        }
    },
    listTypes: async () => {
        try {
            console.log("📋 Fetching leave types");
            const res = await api.get<LeaveType[]>("/leaves/types");
            console.log("✅ Leave types fetched:", res.data);
            return res.data;
        } catch (error: any) {
            console.error("❌ List types error:", {
                status: error.response?.status,
                statusText: error.response?.statusText,
                url: error.config?.url,
                baseURL: error.config?.baseURL,
                method: error.config?.method,
                message: error.message,
                responseData: error.response?.data,
            });
            throw error;
        }
    },
    updateType: async (id: string, data: Partial<CreateLeaveTypeDto>) => {
        try {
            console.log("🔄 Updating leave type:", id, data);
            const res = await api.put<LeaveType>(`/leaves/types/${id}`, data);
            console.log("✅ Leave type updated:", res.data);
            return res.data;
        } catch (error: any) {
            console.error("❌ Update type error:", {
                status: error.response?.status,
                statusText: error.response?.statusText,
                url: error.config?.url,
                baseURL: error.config?.baseURL,
                method: error.config?.method,
                message: error.message,
                responseData: error.response?.data,
            });
            throw error;
        }
    },

    // Policies
    createPolicy: async (data: CreatePolicyDto) => {
        const res = await api.post<LeavePolicy>("/leaves/policies", data);
        return res.data;
    },
    listPolicies: async () => {
        const res = await api.get<LeavePolicy[]>("/leaves/policies");
        return res.data;
    },
    updatePolicy: async (id: string, data: Partial<CreatePolicyDto>) => {
        const res = await api.put<LeavePolicy>(`/leaves/policies/${id}`, data);
        return res.data;
    },

    // Entitlements
    createEntitlement: async (data: CreateEntitlementDto) => {
        try {
            console.log("🚀 Creating entitlement:", data);
            const res = await api.post<LeaveEntitlement>("/leaves/entitlements", data);
            console.log("✅ Entitlement created:", res.data);
            return res.data;
        } catch (error: any) {
            console.error("❌ Create entitlement error:", {
                status: error.response?.status,
                message: error.response?.data?.message || error.message,
                data: error.response?.data,
            });
            throw error;
        }
    },
    updateEntitlement: async (id: string, data: Partial<CreateEntitlementDto>) => {
        try {
            console.log("🔄 Updating entitlement:", id, data);
            const res = await api.patch<LeaveEntitlement>(`/leaves/entitlements/${id}`, data);
            console.log("✅ Entitlement updated:", res.data);
            return res.data;
        } catch (error: any) {
            console.error("❌ Update entitlement error:", {
                status: error.response?.status,
                message: error.response?.data?.message || error.message,
                data: error.response?.data,
            });
            throw error;
        }
    },
    listEntitlements: async () => {
        try {
            console.log("📋 Fetching entitlements");
            const res = await api.get<LeaveEntitlement[]>("/leaves/entitlements");
            console.log("✅ Entitlements fetched:", res.data);
            return res.data;
        } catch (error: any) {
            console.error("❌ List entitlements error:", {
                status: error.response?.status,
                message: error.response?.data?.message || error.message,
                data: error.response?.data,
            });
            throw error;
        }
    },
    getEntitlement: async (employeeId: string) => {
        const res = await api.get<LeaveEntitlement[]>(`/leaves/entitlements/${employeeId}`);
        return res.data;
    },
    adjustBalance: async (employeeId: string, data: ManualAdjustmentDto) => {
        const res = await api.patch(`/leaves/entitlements/${employeeId}/adjust`, data);
        return res.data;
    },
    getAdjustmentLog: async (employeeId: string) => {
        const res = await api.get(`/leaves/audit/adjustments/${employeeId}`);
        return res.data;
    },

    // Requests
    submitRequest: async (data: CreateLeaveRequestDto) => {
        const res = await api.post<LeaveRequest>("/leaves/requests", data);
        return res.data;
    },
    updateRequest: async (id: string, data: Partial<CreateLeaveRequestDto>) => {
        const res = await api.patch<LeaveRequest>(`/leaves/requests/${id}`, data);
        return res.data;
    },
    getMyRequests: async (filters?: ListRequestsFilterDto) => {
        const params = new URLSearchParams();
        if (filters?.status) params.append("status", filters.status);
        if (filters?.from) params.append("from", new Date(filters.from).toISOString());
        if (filters?.to) params.append("to", new Date(filters.to).toISOString());

        const res = await api.get<LeaveRequest[]>(`/leaves/my/requests?${params.toString()}`);
        return res.data;
    },
    getMyBalance: async () => {
        const res = await api.get<LeaveEntitlement[]>("/leaves/my/balance"); // Note: backend returns LeaveEntitlement[]?
        return res.data;
    },
    cancelRequest: async (id: string) => {
        const res = await api.delete(`/leaves/requests/${id}`);
        return res.data;
    },

    // Manager
    getTeamRequests: async () => {
        const res = await api.get<LeaveRequest[]>("/leaves/team/requests");
        return res.data;
    },
    getTeamRequestsFiltered: async (filters: {
        status?: string;
        leaveTypeId?: string;
        departmentId?: string;
        from?: string;
        to?: string;
        sortBy?: 'date' | 'status' | 'employee' | 'type';
        sortOrder?: 'asc' | 'desc';
    }) => {
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.leaveTypeId) params.append('leaveTypeId', filters.leaveTypeId);
            if (filters.departmentId) params.append('departmentId', filters.departmentId);
            if (filters.from) params.append('from', filters.from);
            if (filters.to) params.append('to', filters.to);
            if (filters.sortBy) params.append('sortBy', filters.sortBy);
            if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
            
            console.log("📋 Fetching team requests with filters:", Object.fromEntries(params));
            const res = await api.get<LeaveRequest[]>(`/leaves/team/requests/filtered?${params.toString()}`);
            console.log("✅ Filtered requests fetched:", res.data);
            return res.data;
        } catch (error: any) {
            console.error("❌ Filter requests error:", error);
            throw error;
        }
    },
    getTeamBalances: async () => {
        const res = await api.get<any[]>("/leaves/team/balances");
        return res.data;
    },
    managerAction: async (id: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
        const res = await api.patch(`/leaves/requests/${id}/manager-action`, { action, reason });
        return res.data;
    },
    
    // TWO-LEVEL APPROVAL WORKFLOW
    managerApprove: async (id: string, action: 'APPROVED' | 'REJECTED', reason?: string) => {
        try {
            console.log("📋 Manager approving request:", id, action);
            const res = await api.patch(`/leaves/requests/${id}/manager-approve`, { action, reason });
            console.log("✅ Manager approval submitted:", res.data);
            return res.data;
        } catch (error: any) {
            console.error("❌ Manager approval error:", {
                status: error.response?.status,
                message: error.response?.data?.message || error.message,
                data: error.response?.data,
            });
            throw error;
        }
    },

    hrApprove: async (id: string, action: 'APPROVED' | 'REJECTED', reason?: string) => {
        try {
            console.log("✔️ HR approving request:", id, action);
            const res = await api.patch(`/leaves/requests/${id}/hr-approve`, { action, reason });
            console.log("✅ HR approval submitted:", res.data);
            return res.data;
        } catch (error: any) {
            console.error("❌ HR approval error:", {
                status: error.response?.status,
                message: error.response?.data?.message || error.message,
                data: error.response?.data,
            });
            throw error;
        }
    },

    bulkApprove: async (ids: string[]) => {
        try {
            console.log("🚀 Bulk approving requests:", ids);
            const res = await api.post(`/leaves/requests/bulk-approve`, { ids });
            console.log("✅ Requests bulk approved:", res.data);
            return res.data;
        } catch (error: any) {
            console.error("❌ Bulk approve error:", {
                status: error.response?.status,
                message: error.response?.data?.message || error.message,
                data: error.response?.data,
            });
            throw error;
        }
    },
    bulkReject: async (ids: string[], reason?: string) => {
        try {
            console.log("🚀 Bulk rejecting requests:", ids);
            const res = await api.post(`/leaves/requests/bulk-reject`, { ids, reason });
            console.log("✅ Requests bulk rejected:", res.data);
            return res.data;
        } catch (error: any) {
            console.error("❌ Bulk reject error:", {
                status: error.response?.status,
                message: error.response?.data?.message || error.message,
                data: error.response?.data,
            });
            throw error;
        }
    },
    flagIrregular: async (id: string, reason: string) => {
        const res = await api.patch(`/leaves/requests/${id}/flag`, { reason });
        return res.data;
    },

    // HR Admin
    hrFinalize: async (id: string, override: boolean, finalStatus?: LeaveStatus, comments?: string) => {
        const res = await api.patch(`/leaves/requests/${id}/hr-finalize`, { override, finalStatus, comments });
        return res.data;
    },

    // Batch
    runAccrual: async () => {
        const res = await api.post("/leaves/accrual/run");
        return res.data;
    },
    runCarryForward: async () => {
        const res = await api.post("/leaves/carry-forward/run");
        return res.data;
    },

    // Calendar & Holidays
    getCalendar: async (year: number) => {
        try {
            console.log("📅 Fetching calendar for year:", year);
            const res = await api.get(`/leaves/calendars/${year}`);
            console.log("✅ Calendar fetched:", res.data);
            return res.data;
        } catch (error: any) {
            console.error("❌ Get calendar error:", {
                status: error.response?.status,
                message: error.response?.data?.message || error.message,
                data: error.response?.data,
            });
            throw error;
        }
    },
    createCalendar: async (year: number, holidays: string[], blockedPeriods: any[]) => {
        try {
            console.log("🚀 Creating calendar:", { year, holidays, blockedPeriods });
            console.log("📍 API Details - BaseURL:", api.defaults.baseURL, "Endpoint:", "POST /leaves/calendars");
            console.log("📋 Token exists:", !!localStorage.getItem("access_token"));
            
            // Convert holidays to ISO date strings (not Date objects - Axios serializes Date as object, not string)
            const holidayStrings = holidays.map(h => {
                const d = new Date(h);
                return d.toISOString().split('T')[0]; // YYYY-MM-DD format
            });
            
            // Convert blocked periods to ISO date strings
            const blockedPeriodsFormatted = blockedPeriods.map(p => ({
                from: new Date(p.from).toISOString().split('T')[0],
                to: new Date(p.to).toISOString().split('T')[0],
                reason: p.reason,
            }));
            
            const payload = {
                year,
                holidays: holidayStrings,
                blockedPeriods: blockedPeriodsFormatted,
            };
            
            console.log("📤 Payload being sent:", JSON.stringify(payload, null, 2));
            
            const res = await api.post("/leaves/calendars", payload);
            console.log("✅ Calendar created:", res.data);
            return res.data;
        } catch (error: any) {
            // Comprehensive error logging that handles both response and network errors
            const errorDetails: any = {
                timestamp: new Date().toISOString(),
                errorType: error.name || 'Unknown',
                message: error.message || 'No message provided',
                url: error.config?.url,
                baseURL: error.config?.baseURL,
                method: error.config?.method,
                timeout: error.config?.timeout,
            };
            
            // If response exists, add status details
            if (error.response) {
                errorDetails.hasResponse = true;
                errorDetails.status = error.response.status;
                errorDetails.statusText = error.response.statusText;
                errorDetails.responseData = error.response.data;
            } else {
                // Network error or request failed before getting response
                errorDetails.hasResponse = false;
                errorDetails.code = error.code; // ECONNREFUSED, ENOTFOUND, etc.
            }
            
            console.error("❌ Create calendar error:", errorDetails);
            
            // Also throw with detailed message for debugging
            const errorMessage = `Failed to create calendar: ${errorDetails.message}${
                errorDetails.hasResponse 
                    ? ` (Status ${errorDetails.status}: ${errorDetails.statusText})`
                    : ` (Network Error: ${errorDetails.code})`
            }`;
            throw new Error(errorMessage);
        }
    },
};

export default leavesService;