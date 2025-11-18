import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exception, ExceptionDocument } from './schemas/excetions.schema';
import { CreateExceptionDto } from './dto/create-exception.dto';

// Dummy employees for testing
const dummyEmployees = [
  { employeeId: 'E001', name: 'Alice' },
  { employeeId: 'E002', name: 'Bob' },
  { employeeId: 'E003', name: 'Charlie' },
];

@Injectable()
export class ExceptionsService {
  constructor(
    @InjectModel(Exception.name)
    private exceptionModel: Model<ExceptionDocument>,
  ) {}

  // Validate employee against dummy data
  validateEmployee(employeeId: string) {
    const emp = dummyEmployees.find((e) => e.employeeId === employeeId);
    if (!emp) {
      throw new Error(`Employee '${employeeId}' not found in dummy data`);
    }
    return emp;
  }

  // ---- Create Exception ----
  async requestException(dto: CreateExceptionDto) {
    this.validateEmployee(dto.employeeId);

    const exception = new this.exceptionModel({
      employeeId: dto.employeeId,
      type: dto.type,
      reason: dto.reason,
      value: dto.value,
      status: 'PENDING', // default status
    });

    return exception.save();
  }

  // ---- Approve Request ----
  async approve(id: string, comment: string = 'Approved by manager') {
    return this.exceptionModel.findByIdAndUpdate(
      id,
      { status: 'APPROVED', managerComment: comment },
      { new: true },
    );
  }

  // ---- Get Pending Exceptions ----
  async getPending() {
    return this.exceptionModel.find({ status: 'PENDING' }).lean();
  }
}
