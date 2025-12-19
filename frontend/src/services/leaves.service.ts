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
        const res = await api.post<LeaveType>("/leaves/types", data);
        return res.data;
    },
    listTypes: async () => {
        const res = await api.get<LeaveType[]>("/leaves/types");
        return res.data;
    },
    updateType: async (id: string, data: Partial<CreateLeaveTypeDto>) => {
        const res = await api.put<LeaveType>(`/leaves/types/${id}`, data);
        return res.data;
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
        const res = await api.post<LeaveEntitlement>("/leaves/entitlements", data);
        return res.data;
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
    getTeamBalances: async () => {
        const res = await api.get<any[]>("/leaves/team/balances");
        return res.data;
    },
    managerAction: async (id: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
        const res = await api.patch(`/leaves/requests/${id}/manager-action`, { action, reason });
        return res.data;
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
};
