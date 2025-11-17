import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exception, ExceptionDocument } from './schemas/excetions.schema';
import { CreateExceptionDto } from './dto/create-exception.dto';


// Dummy data
const employees = require('../external/employee.json');

@Injectable()
export class ExceptionsService {
  constructor(
    @InjectModel(Exception.name)
    private exceptionModel: Model<ExceptionDocument>,
  ) {}

  validateEmployee(employeeId: string) {
    const emp = employees.find(e => e.employeeId === employeeId);
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

  // ---- Get Pending ----
  async getPending() {
    return this.exceptionModel.find({ status: 'PENDING' }).lean();
  }
}