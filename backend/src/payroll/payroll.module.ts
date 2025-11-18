import { Module } from '@nestjs/common';
import { ConfigurationPolicyModule } from './configuration-policy/configuration.module';
import { ProcessingModule } from './processing-execution/processing.module'; // Assuming file is named processing.module.ts
import { TrackingModule } from './tracking-self-service/tracking.module'; // Assuming file is named tracking.module.ts
import {EmployeeModule} from '../employee/employee.module';
import {AttendanceModule} from '../attendance/attendance.module';
import {OrgStructureModule} from '../org-structure/org-structure.module';

@Module({
  imports: [
    // Register all three payroll subsystems here
    ConfigurationPolicyModule,
    ProcessingModule,
    TrackingModule,
     EmployeeModule,
  AttendanceModule,
  OrgStructureModule,
  ],
  controllers: [],
  providers: [],
  exports: [ConfigurationPolicyModule, ProcessingModule, TrackingModule],
})
export class PayrollModule {}
