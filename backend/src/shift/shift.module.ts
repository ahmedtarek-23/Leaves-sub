import { Module } from '@nestjs/common';
import { ShiftService } from './shift.service';
import { ShiftController } from './shift.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Shift, ShiftSchema } from './schemas/shift.schema';

import { EmployeeModule } from '../employee/employee.module';
import { OrgStructureModule } from '../org-structure/org-structure.module';
import { AttendanceModule } from '../attendance/attendance.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Shift.name, schema: ShiftSchema }]),

    EmployeeModule,
    OrgStructureModule,
    AttendanceModule,
  ],

  controllers: [ShiftController],
  providers: [ShiftService],

  exports: [ShiftService],
})
export class ShiftModule {}
