import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

import { EmployeePayRecord } from './schema/employee-pay-record.schema';

@Injectable()
export class ProcessingExecutionService {
  private readonly logger = new Logger(ProcessingExecutionService.name);
  private employees: any[] = [];

  constructor(
    @InjectModel(EmployeePayRecord.name)
    private employeePayRecordModel: Model<any>,
  ) {
    this.loadDummyEmployeeData();
  }

  private loadDummyEmployeeData(): void {
    try {
      const dataPath = path.join(
        __dirname,
        'dummy-data',
        'employee_dummydata.json',
      );
      const rawData = fs.readFileSync(dataPath, 'utf-8');
      this.employees = JSON.parse(rawData);
      this.logger.log(`Loaded ${this.employees.length} dummy employees.`);
    } catch (error) {
      this.logger.error('Could not load dummy employee data.', error.stack);
    }
  }

  async simulatePayrollRun(runConfig: any): Promise<{ message: string }> {
    return { message: 'dummy payroll run executed' };
  }

  async getEmployeePayRecord(employeeId: string): Promise<any | null> {
    return await this.employeePayRecordModel.findOne({ employeeId }).exec();
  }

  async getDummyEmployees(): Promise<any[]> {
    return this.employees;
  }
}
