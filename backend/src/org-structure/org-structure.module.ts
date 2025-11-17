import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrgStructureController } from './org-structure.controller';
import { OrgStructureService } from './org-structure.service';

import { Department, DepartmentSchema } from './schemas/department.schema';
import { Position, PositionSchema } from './schemas/position.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Department.name, schema: DepartmentSchema },
      { name: Position.name, schema: PositionSchema },
    ]),
  ],
  controllers: [OrgStructureController],
  providers: [OrgStructureService],
   exports: [OrgStructureService],
})
export class OrgStructureModule {}
