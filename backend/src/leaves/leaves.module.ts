import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveRequest } from './models/leave-request.schema';
// Import all 8 schemas you registered in leaves.module.ts
import { LeaveType } from './models/leave-type.schema';
import { LeavePolicy } from './models/leave-policy.schema';
import { LeaveEntitlement } from './models/leave-entitlement.schema';
// ... import other model types (LeaveCategory, Calendar, etc.)

// Import dependent services
import { TimeManagementService } from '../time-management/time-management.service';
import { EmployeeProfileService } from '../employee-profile/employee-profile.service'; 
// Note: Payroll dependency is likely needed, but we'll use the service injection you defined.

@Injectable()
export class LeavesService {
  private readonly logger = new Logger(LeavesService.name);

  constructor(
    // 1. Inject all Mongoose Models using @InjectModel()
    @InjectModel(LeaveRequest.name) private leaveRequestModel: Model<LeaveRequest>,
    @InjectModel(LeaveType.name) private leaveTypeModel: Model<LeaveType>,
    @InjectModel(LeavePolicy.name) private leavePolicyModel: Model<LeavePolicy>,
    @InjectModel(LeaveEntitlement.name) private leaveEntitlementModel: Model<LeaveEntitlement>,
    // Inject the remaining 4 models here...
    
    // 2. Inject dependent services (for M2 integration calls)
    private readonly timeManagementService: TimeManagementService,
    private readonly employeeProfileService: EmployeeProfileService,
    // Add Payroll Service injection here if you haven't yet
    // private readonly payrollProcessingService: PayrollProcessingService,
  ) {}

  // ... Implement core methods below
}