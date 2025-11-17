import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeavesService } from './leaves.service';
import { LeavePolicy, LeavePolicySchema } from './schemas/leave-policy.schema';
import { LeaveBalance, LeaveBalanceSchema } from './schemas/leave-balance.schema';
import { LeaveRequest, LeaveRequestSchema } from './schemas/leave-request.schema';

import { EmployeeModule } from '../employee/employee.module';
import { AttendanceModule } from '../attendance/attendance.module';
//import { PayrollModule } from '../payroll/payroll.module';

@Module({
  imports: [
    // 1. Register Mongoose Schemas (Database Models)
    MongooseModule.forFeature([
      { name: LeavePolicy.name, schema: LeavePolicySchema },
      { name: LeaveBalance.name, schema: LeaveBalanceSchema },
      { name: LeaveRequest.name, schema: LeaveRequestSchema },
    ]),
    
    // 2. Import dependent modules for integration foundation (M1)
     EmployeeModule,
    AttendanceModule,
    //PayrollModule,
  ],
  providers: [LeavesService],
  exports: [LeavesService], // Export the service so other modules can use it
})
export class LeavesModule {}
