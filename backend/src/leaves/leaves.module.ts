<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
import { NotificationService } from './notifications/notification.service';

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
    private readonly notificationService: NotificationService, 
    // Add Payroll Service injection here if you haven't yet
    // private readonly payrollProcessingService: PayrollProcessingService,
  ) {}

  // ... Implement core methods below
}
=======
import { Module } from '@nestjs/common';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaveType, LeaveTypeSchema } from './models/leave-type.schema';
import { LeaveRequest, LeaveRequestSchema } from './models/leave-request.schema';
import { LeavePolicy, LeavePolicySchema } from './models/leave-policy.schema';
import { LeaveEntitlement, LeaveEntitlementSchema } from './models/leave-entitlement.schema';
import { LeaveCategory, LeaveCategorySchema } from './models/leave-category.schema';
import { LeaveAdjustment, LeaveAdjustmentSchema } from './models/leave-adjustment.schema';
import { Calendar, CalendarSchema} from './models/calendar.schema';
import { Attachment,AttachmentSchema } from './models/attachment.schema';
import { EmployeeProfileModule } from '../employee-profile/employee-profile.module';
import { TimeManagementModule } from '../time-management/time-management.module';

@Module({
  imports:[MongooseModule.forFeature([{name:LeaveType.name,schema:LeaveTypeSchema},
    {name:LeaveRequest.name, schema: LeaveRequestSchema},
    {name:LeavePolicy.name, schema:LeavePolicySchema},
    {name:LeaveEntitlement.name, schema:LeaveEntitlementSchema},
    {name: LeaveCategory.name, schema:LeaveCategorySchema},
    {name: LeaveAdjustment.name, schema:LeaveAdjustmentSchema},
    {name:Calendar.name, schema:CalendarSchema},
    {name:Attachment.name, schema: AttachmentSchema}
  ]),EmployeeProfileModule,TimeManagementModule],
  controllers: [LeavesController],
  providers: [LeavesService],
  exports:[LeavesService]
})
export class LeavesModule {}
>>>>>>> Stashed changes
=======
import { Module } from '@nestjs/common';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaveType, LeaveTypeSchema } from './models/leave-type.schema';
import { LeaveRequest, LeaveRequestSchema } from './models/leave-request.schema';
import { LeavePolicy, LeavePolicySchema } from './models/leave-policy.schema';
import { LeaveEntitlement, LeaveEntitlementSchema } from './models/leave-entitlement.schema';
import { LeaveCategory, LeaveCategorySchema } from './models/leave-category.schema';
import { LeaveAdjustment, LeaveAdjustmentSchema } from './models/leave-adjustment.schema';
import { Calendar, CalendarSchema} from './models/calendar.schema';
import { Attachment,AttachmentSchema } from './models/attachment.schema';
import { EmployeeProfileModule } from '../employee-profile/employee-profile.module';
import { TimeManagementModule } from '../time-management/time-management.module';

@Module({
  imports:[MongooseModule.forFeature([{name:LeaveType.name,schema:LeaveTypeSchema},
    {name:LeaveRequest.name, schema: LeaveRequestSchema},
    {name:LeavePolicy.name, schema:LeavePolicySchema},
    {name:LeaveEntitlement.name, schema:LeaveEntitlementSchema},
    {name: LeaveCategory.name, schema:LeaveCategorySchema},
    {name: LeaveAdjustment.name, schema:LeaveAdjustmentSchema},
    {name:Calendar.name, schema:CalendarSchema},
    {name:Attachment.name, schema: AttachmentSchema}
  ]),EmployeeProfileModule,TimeManagementModule],
  controllers: [LeavesController],
  providers: [LeavesService],
  exports:[LeavesService]
})
export class LeavesModule {}
>>>>>>> Stashed changes
