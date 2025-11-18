import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Assignment, AssignmentDocument } from './schema/assignment.schema';
import { AssignShiftDto } from './dto/assign-shift.dto';

// Dummy employees for testing
const dummyEmployees = [
  { employeeId: 'E001', name: 'Alice' },
  { employeeId: 'E002', name: 'Bob' },
  { employeeId: 'E003', name: 'Charlie' },
];

@Injectable()
export class AssignmentService {
  constructor(
    @InjectModel(Assignment.name)
    private readonly assignmentModel: Model<AssignmentDocument>,
  ) {}

  // Validate employee against dummy data
  validateEmployee(employeeId: string) {
    const emp = dummyEmployees.find((e) => e.employeeId === employeeId);

    if (!emp) {
      throw new Error(`Employee '${employeeId}' not found in dummy data`);
    }

    return emp;
  }

  // Assign shift
  async assignShift(dto: AssignShiftDto) {
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

  // Get assignments for an employee
  async findAssignmentsForEmployee(employeeId: string) {
    return this.assignmentModel.find({ employeeId }).lean();
  }

  // Remove an assignment
  async removeAssignment(id: string) {
    return this.assignmentModel.findByIdAndDelete(id).lean();
  }
}
