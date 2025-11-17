import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PerformanceModule } from './performance/performance.module';
import { OrgStructureModule } from './org-structure/org-structure.module';
import { EmployeeModule } from './employee/employee.module';
import { ShiftModule } from './shift/shift.module';
import { ExceptionsModule } from './exceptions/exceptions.module';
import { AttendanceModule } from './attendance/attendance.module';
import { AssignmentModule } from './assignment/assignment.module';
import { AvailabilityModule } from './availability/availability.module';
import { LeavesModule } from './leaves/leaves.module';
import { RecruitmentModule } from './recruitment/recruitment.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRoot(process.env.MONGO_URI!),

    PerformanceModule,
    OrgStructureModule,
    EmployeeModule,
    ShiftModule,
    ExceptionsModule,
    AttendanceModule,
    AssignmentModule,
    AvailabilityModule,
    LeavesModule,
    RecruitmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
