import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Availability, AvailabilityDocument } from './schemas/availability.schema';

// Dummy data
const availabilityData = require('../external/availability.json');
const employees = require('../external/employee.json');

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectModel(Availability.name)
    private availabilityModel: Model<AvailabilityDocument>,
  ) {}

  validateEmployee(employeeId: string) {
    const emp = employees.find(e => e.employeeId === employeeId);
    if (!emp) {
      throw new Error(`Employee '${employeeId}' not found in dummy data`);
    }
    return emp;
  }

  // ---- Get Availability by Employee ID ----
  async getByEmployeeId(employeeId: string) {
    this.validateEmployee(employeeId);

    // Return from dummy data for Milestone 1
    const employeeAvailability = availabilityData.filter(
      (a) => a.employeeId === employeeId,
    );

    if (employeeAvailability.length === 0) {
      return {
        message: `No availability data found for employee ${employeeId}`,
        employeeId,
        availability: [],
      };
    }

    return {
      employeeId,
      availability: employeeAvailability,
    };
  }
}
