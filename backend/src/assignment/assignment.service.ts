import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Assignment, AssignmentDocument } from './schema/assignment.schema';
import { AssignShiftDto } from './dto/assign-shift.dto';
const employees = require('../../external/employee_dummydata.json');

@Injectable()
export class AssignmentService {
  constructor(
    @InjectModel(Assignment.name)
    private readonly assignmentModel: Model<AssignmentDocument>,
  ) {}

  validateEmployee(employeeId: string) {
    const emp = (employees as any[]).find(e => e.employeeId === employeeId);

    if (!emp) {
      throw new Error(`Employee '${employeeId}' not found in dummy data`);
    }

    return emp;
  }

  async assignShift(dto: AssignShiftDto) {
    // validate employee using dummy data
    this.validateEmployee(dto.employeeId);

    const assignment = new this.assignmentModel({
      employeeId: dto.employeeId,
      shiftId: dto.shiftId,
      startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      active: true,
    });

    return assignment.save();
  }

  async findAssignmentsForEmployee(employeeId: string) {
    return this.assignmentModel.find({ employeeId }).lean();
  }

  async removeAssignment(id: string) {
    return this.assignmentModel.findByIdAndDelete(id).lean();
  }
}
