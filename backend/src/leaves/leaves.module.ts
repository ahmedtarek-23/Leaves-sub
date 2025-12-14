import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';
import { NotificationService } from './notifications/notification.service';

// Import all schemas
import {
  LeaveRequest,
  LeaveRequestSchema,
} from './models/leave-request.schema';
import { LeaveType, LeaveTypeSchema } from './models/leave-type.schema';
import { LeaveCategory, LeaveCategorySchema } from './models/leave-category.schema';
import { LeavePolicy, LeavePolicySchema } from './models/leave-policy.schema';
import {
  LeaveEntitlement,
  LeaveEntitlementSchema,
} from './models/leave-entitlement.schema';
import {
  LeaveAdjustment,
  LeaveAdjustmentSchema,
} from './models/leave-adjustment.schema';
import { Calendar, CalendarSchema } from './models/calendar.schema';
import { Attachment, AttachmentSchema } from './models/attachment.schema';
import {
  ManualAdjustmentLog,
  ManualAdjustmentLogSchema,
} from './models/manual-adjustment-log.schema';
import {
  LeaveEncashmentRecord,
  LeaveEncashmentRecordSchema,
} from './models/leave-encashment-record.schema';
import {
  LeaveDelegation,
  LeaveDelegationSchema,
} from './models/leave-delegation.schema';
import {
  LeaveAuditLog,
  LeaveAuditLogSchema,
} from './models/leave-audit-log.schema';
import {
  LeaveNotification,
  LeaveNotificationSchema,
} from './models/leave-notification.schema';
import {
  LeaveAccrual,
  LeaveAccrualSchema,
} from './models/leave-accrual.schema';
import {
  LeaveBalance,
  LeaveBalanceSchema,
} from './models/leave-balance.schema';
import {
  ResetPolicy,
  ResetPolicySchema,
} from './models/reset-policy.schema';

// Import dependent modules
import { TimeManagementModule } from '../time-management/time-management.module';
import { EmployeeProfileModule } from '../employee-profile/employee-profile.module';
import { PayrollExecutionModule } from '../payroll-execution/payroll-execution.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeaveRequest.name, schema: LeaveRequestSchema },
      { name: LeaveType.name, schema: LeaveTypeSchema },
      { name: LeaveCategory.name, schema: LeaveCategorySchema },
      { name: LeavePolicy.name, schema: LeavePolicySchema },
      { name: LeaveEntitlement.name, schema: LeaveEntitlementSchema },
      { name: LeaveAdjustment.name, schema: LeaveAdjustmentSchema },
      { name: Calendar.name, schema: CalendarSchema },
      { name: Attachment.name, schema: AttachmentSchema },
      { name: ManualAdjustmentLog.name, schema: ManualAdjustmentLogSchema },
      {
        name: LeaveEncashmentRecord.name,
        schema: LeaveEncashmentRecordSchema,
      },
      { name: LeaveDelegation.name, schema: LeaveDelegationSchema },
      { name: LeaveAuditLog.name, schema: LeaveAuditLogSchema },
      { name: LeaveNotification.name, schema: LeaveNotificationSchema },
      { name: LeaveAccrual.name, schema: LeaveAccrualSchema },
      { name: LeaveBalance.name, schema: LeaveBalanceSchema },
      { name: ResetPolicy.name, schema: ResetPolicySchema },
    ]),
    TimeManagementModule,
    EmployeeProfileModule,
    PayrollExecutionModule,
  ],
  controllers: [LeavesController],
  providers: [LeavesService, NotificationService],
  exports: [LeavesService],
})
export class LeavesModule {}
