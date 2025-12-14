/**
 * Interfaces for external service integrations
 * These interfaces define the contract for services that Leaves module depends on
 */

export interface ITimeManagementService {
    blockLeavePeriod?(params: {
        employeeId: string;
        leaveRequestId: string;
        startDate: Date;
        endDate: Date;
        leaveType: string;
    }): Promise<void>;
}

export interface IPayrollExecutionService {
    applyLeaveAdjustment?(params: {
        employeeId: string;
        leaveRequestId: string;
        leaveType: string;
        duration: number;
        startDate: Date;
        endDate: Date;
        payrollCode: string;
    }): Promise<void>;
    
    processFinalPayment?(params: {
        employeeId: string;
        encashmentAmount: number;
    }): Promise<void>;
}

export interface IEmployeeProfileService {
    getEmployeeProfile?(employeeId: string): Promise<{
        _id?: any;
        supervisorPositionId?: string;
        primaryPositionId?: string;
        workEmail?: string;
        firstName?: string;
        lastName?: string;
    }>;
    
    getTeamMembers?(managerId: string): Promise<Array<{
        _id: any;
        [key: string]: any;
    }>>;
}

