export enum LeaveStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    CANCELLED = 'cancelled',
    ESCALATED = 'ESCALATED',
    ENCASHED = 'ENCASHED',
}

export enum AttachmentType {
    MEDICAL = 'medical',
    DOCUMENT = 'document',
    OTHER = 'other',
}

export interface LeaveType {
    _id: string;
    code: string;
    name: string;
    categoryId: string; // Mocking ObjectId as string
    description?: string;
    paid: boolean;
    deductible: boolean; // deducts from annual balance?
    requiresAttachment: boolean;
    attachmentType?: AttachmentType;
    minTenureMonths?: number;
    maxDurationDays?: number;
}

export interface LeaveRequest {
    _id: string;
    employeeId: string;
    leaveTypeId: string;
    startDate: string | Date; // Date string or object
    endDate: string | Date;
    durationDays: number;
    justification?: string;
    status: LeaveStatus;

    // Populated fields for UI
    leaveTypeName?: string;
    employeeName?: string;

    // Attachments?
    hasAttachments?: boolean;

    // Approval Flow
    approvalFlow?: {
        role: string;
        status: string;
        decidedBy?: string;
        decidedAt?: string | Date;
    }[];

    createdAt: string | Date;
}

export interface UserBalance {
    employeeId: string;
    annualQuota: number;
    used: number;
    remaining: number;
}
