import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Availability,
  AvailabilityDocument,
} from './schemas/availability.schema';

// Dummy employees
const dummyEmployees = [
  { employeeId: 'E001', name: 'Alice' },
  { employeeId: 'E002', name: 'Bob' },
  { employeeId: 'E003', name: 'Charlie' },
];

// Dummy availability data
const dummyAvailability = [
  { employeeId: 'E001', day: 'Monday', startTime: '09:00', endTime: '17:00' },
  { employeeId: 'E002', day: 'Tuesday', startTime: '10:00', endTime: '18:00' },
  {
    employeeId: 'E003',
    day: 'Wednesday',
    startTime: '08:00',
    endTime: '16:00',
  },
];

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectModel(Availability.name)
    private availabilityModel: Model<AvailabilityDocument>,
  ) {}

  // Validate employee against dummy data
  validateEmployee(employeeId: string) {
    const emp = dummyEmployees.find((e) => e.employeeId === employeeId);
    if (!emp) {
      throw new Error(`Employee '${employeeId}' not found in dummy data`);
    }
    return emp;
  }

  // ---- Get Availability by Employee ID ----
  async getByEmployeeId(employeeId: string) {
    this.validateEmployee(employeeId);

    const employeeAvailability = dummyAvailability.filter(
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
