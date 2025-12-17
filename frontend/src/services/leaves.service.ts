import {
    LeaveType,
    LeaveRequest,
    LeaveStatus,
    UserBalance,
    AttachmentType
} from '../types/leaves';

// --- Mock Data ---

const MOCK_LEAVE_TYPES: LeaveType[] = [
    {
        _id: 'lt-001',
        code: 'ANN',
        name: 'Annual Leave',
        categoryId: 'cat-001',
        paid: true,
        deductible: true,
        requiresAttachment: false,
        description: 'Standard paid vacation'
    },
    {
        _id: 'lt-002',
        code: 'SICK',
        name: 'Sick Leave',
        categoryId: 'cat-002',
        paid: true,
        deductible: false,
        requiresAttachment: true,
        attachmentType: AttachmentType.MEDICAL,
        description: 'Medical leave, requires certificate'
    }
];

const MOCK_REQUESTS: LeaveRequest[] = [
    {
        _id: 'req-101',
        employeeId: 'emp-001',
        employeeName: 'John Doe',
        leaveTypeId: 'lt-001',
        leaveTypeName: 'Annual Leave',
        startDate: '2023-11-20',
        endDate: '2023-11-22',
        durationDays: 3,
        justification: 'Family vacation',
        status: LeaveStatus.PENDING,
        createdAt: '2023-11-15',
        approvalFlow: []
    },
    {
        _id: 'req-102',
        employeeId: 'emp-002',
        employeeName: 'Jane Smith',
        leaveTypeId: 'lt-002',
        leaveTypeName: 'Sick Leave',
        startDate: '2023-11-10',
        endDate: '2023-11-10',
        durationDays: 1,
        justification: 'Flu',
        status: LeaveStatus.APPROVED,
        createdAt: '2023-11-10',
        approvalFlow: [
            { role: 'Manager', status: 'approved', decidedAt: '2023-11-11' }
        ]
    }
];

const MOCK_BALANCES: Record<string, UserBalance> = {
    'emp-001': { employeeId: 'emp-001', annualQuota: 21, used: 5, remaining: 16 }
};

// --- Service ---

export const LeavesService = {
    delay: (ms = 500) => new Promise(resolve => setTimeout(resolve, ms)),

    // Policies (Admin)
    async getLeaveTypes(): Promise<LeaveType[]> {
        await this.delay();
        return [...MOCK_LEAVE_TYPES];
    },

    async createLeaveType(data: Partial<LeaveType>): Promise<LeaveType> {
        await this.delay();
        const newType: LeaveType = {
            _id: `lt-${Date.now()}`,
            code: data.code || 'UNK',
            name: data.name || 'Unknown',
            categoryId: 'cat-001',
            paid: data.paid ?? true,
            deductible: data.deductible ?? true,
            requiresAttachment: data.requiresAttachment ?? false,
            ...data
        };
        MOCK_LEAVE_TYPES.push(newType);
        return newType;
    },

    // Requests (Employee)
    async getMyRequests(employeeId: string = 'emp-001'): Promise<LeaveRequest[]> {
        await this.delay();
        return MOCK_REQUESTS.filter(r => r.employeeId === employeeId);
    },

    async getBalance(employeeId: string = 'emp-001'): Promise<UserBalance> {
        await this.delay();
        return MOCK_BALANCES[employeeId] || { employeeId, annualQuota: 21, used: 0, remaining: 21 };
    },

    async submitRequest(data: Partial<LeaveRequest>): Promise<LeaveRequest> {
        await this.delay();
        const type = MOCK_LEAVE_TYPES.find(t => t._id === data.leaveTypeId);
        const newReq: LeaveRequest = {
            _id: `req-${Date.now()}`,
            employeeId: 'emp-001', // Mock current user
            leaveTypeId: data.leaveTypeId!,
            leaveTypeName: type?.name,
            startDate: data.startDate!,
            endDate: data.endDate!,
            durationDays: data.durationDays || 1,
            justification: data.justification,
            status: LeaveStatus.PENDING,
            createdAt: new Date(),
            approvalFlow: [],
            ...data
        } as LeaveRequest;

        MOCK_REQUESTS.push(newReq);
        return newReq;
    },

    // Approval (Manager)
    async getPendingApprovals(managerId: string = 'emp-mgr'): Promise<LeaveRequest[]> {
        await this.delay();
        // Mock: show all pending requests not by me
        return MOCK_REQUESTS.filter(r => r.status === LeaveStatus.PENDING && r.employeeId !== managerId);
    },

    async processRequest(requestId: string, status: LeaveStatus.APPROVED | LeaveStatus.REJECTED): Promise<LeaveRequest> {
        await this.delay();
        const req = MOCK_REQUESTS.find(r => r._id === requestId);
        if (!req) throw new Error('Request not found');

        req.status = status;
        req.approvalFlow?.push({
            role: 'Manager',
            status: status,
            decidedAt: new Date()
        });
        return req;
    }
};
