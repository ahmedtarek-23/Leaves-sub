import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

/* ----------  Leave  ---------- */
import { LeaveType, LeaveTypeSchema } from './models/leave-type.schema';
import { LeavePolicy, LeavePolicySchema } from './models/leave-policy.schema';
import { LeaveEntitlement, LeaveEntitlementSchema } from './models/leave-entitlement.schema';
import { LeaveRequest, LeaveRequestSchema } from './models/leave-request.schema';
import { LeaveAdjustment, LeaveAdjustmentSchema } from './models/leave-adjustment.schema';
import { LeaveCategory, LeaveCategorySchema } from './models/leave-category.schema';
import { Calendar, CalendarSchema } from './models/calendar.schema';
import { ScheduleModule } from '@nestjs/schedule'; // ← 1
import { LeavesScheduler } from './leaves.schedular'; // ← 2
import { LeavesNotifications } from './leaves.notifications';

/* ----------  Employee / Org  (stubs) ---------- */
import { EmployeeProfile, EmployeeProfileSchema } from '../employee-profile/models/employee-profile.schema';
import { Department, DepartmentSchema } from '../organization-structure/models/department.schema';

/* ----------  Controllers / Services  ---------- */
import { LeaveController } from './leaves.controller';
import { LeaveService } from './leaves.service';

@Module({
  imports: [
    ScheduleModule.forRoot(), // ← 1
    MongooseModule.forFeature([
      { name: LeaveType.name, schema: LeaveTypeSchema },
      { name: LeavePolicy.name, schema: LeavePolicySchema },
      { name: LeaveEntitlement.name, schema: LeaveEntitlementSchema },
      { name: LeaveRequest.name, schema: LeaveRequestSchema },
      { name: LeaveAdjustment.name, schema: LeaveAdjustmentSchema },
      { name: LeaveCategory.name, schema: LeaveCategorySchema },
      { name: Calendar.name, schema: CalendarSchema },
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
      { name: Department.name, schema: DepartmentSchema },
    ]),
  ],
  controllers: [LeaveController],
  providers: [LeaveService,LeavesScheduler,LeavesNotifications],
  exports: [LeaveService],
})
export class LeavesModule {}