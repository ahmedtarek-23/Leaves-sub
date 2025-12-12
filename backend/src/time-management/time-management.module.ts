import { Module } from '@nestjs/common';
import { TimeManagementController } from './time-management.controller';
import { TimeManagementService } from './time-management.service';
import { ShiftTypeController } from './shift-type.controller';
import { ShiftTypeService } from './shift-type.service';
import { ScheduleRuleController } from './schedule-rule.controller';
import { ScheduleRuleService } from './schedule-rule.service';
import { HolidayController } from './holiday.controller';
import { HolidayService } from './holiday.service';
import { ShiftAssignmentController } from './shift-assignment.controller';
import { ShiftAssignmentService } from './shift-assignment.service';
import { ShiftController } from './shift.controller';
import { ShiftService } from './shift.service';
import { LatenessRuleController } from './lateness-rule.controller';
import { LatenessRuleService } from './lateness-rule.service';
import { OvertimeRuleController } from './overtime-rule.controller';
import { OvertimeRuleService } from './overtime-rule.service';
import { TimeExceptionController } from './time-exception.controller';
import { TimeExceptionService } from './time-exception.service';
import { CorrectionController } from './correction.controller';
import { CorrectionService } from './correction.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationLogSchema, NotificationLog } from './models/notification-log.schema';
import { AttendanceCorrectionRequestSchema, AttendanceCorrectionRequest } from './models/attendance-correction-request.schema';
import { ShiftTypeSchema, ShiftType } from './models/shift-type.schema';
import { ScheduleRuleSchema, ScheduleRule } from './models/schedule-rule.schema';
import { AttendanceRecordSchema, AttendanceRecord } from './models/attendance-record.schema';
import { TimeExceptionSchema, TimeException } from './models/time-exception.schema';
import { OvertimeRuleSchema, OvertimeRule } from './models/overtime-rule.schema';
import { ShiftSchema, Shift } from './models/shift.schema';
import { ShiftAssignmentSchema, ShiftAssignment } from './models/shift-assignment.schema';
import { LatenessRule, latenessRuleSchema } from './models/lateness-rule.schema';
import { HolidaySchema, Holiday } from './models/holiday.schema';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
    { name: NotificationLog.name, schema: NotificationLogSchema },
    { name: AttendanceCorrectionRequest.name, schema: AttendanceCorrectionRequestSchema },
    { name: ShiftType.name, schema: ShiftTypeSchema },
    { name: ScheduleRule.name, schema: ScheduleRuleSchema },
    { name: AttendanceRecord.name, schema: AttendanceRecordSchema },
    { name: TimeException.name, schema: TimeExceptionSchema },
    { name: OvertimeRule.name, schema: OvertimeRuleSchema },
    { name: Shift.name, schema: ShiftSchema },
    { name: ShiftAssignment.name, schema: ShiftAssignmentSchema },
    { name: LatenessRule.name, schema: latenessRuleSchema },
    { name: Holiday.name, schema: HolidaySchema },
  ])],
  controllers: [
    TimeManagementController,
    ShiftTypeController,
    ScheduleRuleController,
    HolidayController,
    ShiftAssignmentController,
    ShiftController,
    LatenessRuleController,
    OvertimeRuleController,
    TimeExceptionController,
    CorrectionController,
    AttendanceController,
  ],
  providers: [
    TimeManagementService,
    ShiftTypeService,
    ScheduleRuleService,
    HolidayService,
    ShiftAssignmentService,
    ShiftService,
    LatenessRuleService,
    OvertimeRuleService,
    TimeExceptionService,
    CorrectionService,
    AttendanceService,
  ],
  exports: [
    LatenessRuleService,
    OvertimeRuleService,
    TimeExceptionService,
    CorrectionService,
    AttendanceService,
  ]
})
export class TimeManagementModule { }
