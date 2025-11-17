import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';

interface Employee {
  employeeId: string;
  [key: string]: any;
}

interface Leave {
  employeeId: string;
  startDate: string;
  endDate: string;
  status: 'approved' | 'pending' | 'rejected';
}

interface Offboarding {
  employeeId: string;
  effectiveDate: string;
}

interface Shift {
  shiftId: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  shiftType: 'normal' | 'overnight' | 'split' | 'rotational';
  gracePeriodMinutes: number;
}

interface ShiftAssignment {
  assignmentId: string;
  employeeId: string;
  shiftId: string;
  startDate: string;
  endDate: string | null;
  restDays: string[];
}


@Injectable()
export class AttendanceService implements OnModuleInit {
  private employees: Employee[] = [];
  private leaves: Leave[] = [];
  private offboardings: Offboarding[] = [];
  private shifts: Shift[] = [];
  private shiftAssignments: ShiftAssignment[] = [];

  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
  ) {}

  onModuleInit(): void {
    this.loadDummyData();
  }

  private loadDummyData(): void {
    const dummyDataPath = path.join(process.cwd(), 'dummy-data');

    try {
      const employeesPath = path.join(dummyDataPath, 'employees.json');
      const leavesPath = path.join(dummyDataPath, 'leaves.json');
      const offboardingPath = path.join(dummyDataPath, 'offboarding.json');
      const shiftsPath = path.join(dummyDataPath, 'shifts.json');
      const shiftAssignmentsPath = path.join(
        dummyDataPath,
        'shift-assignments.json',
      );

      if (fs.existsSync(employeesPath)) {
        this.employees = JSON.parse(fs.readFileSync(employeesPath, 'utf-8'));
      }

      if (fs.existsSync(leavesPath)) {
        this.leaves = JSON.parse(fs.readFileSync(leavesPath, 'utf-8'));
      }

      if (fs.existsSync(offboardingPath)) {
        this.offboardings = JSON.parse(
          fs.readFileSync(offboardingPath, 'utf-8'),
        );
      }

      if (fs.existsSync(shiftsPath)) {
        this.shifts = JSON.parse(fs.readFileSync(shiftsPath, 'utf-8'));
      }

      if (fs.existsSync(shiftAssignmentsPath)) {
        this.shiftAssignments = JSON.parse(
          fs.readFileSync(shiftAssignmentsPath, 'utf-8'),
        );
      }
    } catch (error) {
      console.warn('Warning: Could not load dummy data files', error.message);
    }
  }

  private getEmployee(employeeId: string): Employee {
    const employee = this.employees.find((e) => e.employeeId === employeeId);
    if (!employee) {
      throw new NotFoundException(
        `Employee with ID ${employeeId} not found`,
      );
    }
    return employee;
  }

  private isTerminated(employeeId: string, date: Date): boolean {
    const offboarding = this.offboardings.find(
      (o) => o.employeeId === employeeId,
    );
    if (!offboarding) {
      return false;
    }

    const effectiveDate = new Date(offboarding.effectiveDate);
    effectiveDate.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return checkDate >= effectiveDate;
  }

  private isOnLeave(employeeId: string, date: Date): boolean {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return this.leaves.some((leave) => {
      if (leave.employeeId !== employeeId || leave.status !== 'approved') {
        return false;
      }

      const startDate = new Date(leave.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(leave.endDate);
      endDate.setHours(0, 0, 0, 0);

      return checkDate >= startDate && checkDate <= endDate;
    });
  }

  private getShiftAssignment(employeeId: string, date: Date): ShiftAssignment {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    const assignment = this.shiftAssignments.find((sa) => {
      if (sa.employeeId !== employeeId) {
        return false;
      }

      const startDate = new Date(sa.startDate);
      startDate.setHours(0, 0, 0, 0);

      if (checkDate < startDate) {
        return false;
      }

      if (sa.endDate === null) {
        return true;
      }

      const endDate = new Date(sa.endDate);
      endDate.setHours(0, 0, 0, 0);

      return checkDate <= endDate;
    });

    if (!assignment) {
      throw new NotFoundException(
        `No shift assignment found for employee ${employeeId} on ${date.toISOString().split('T')[0]}`,
      );
    }

    return assignment;
  }

  private getShift(shiftId: string): Shift {
    const shift = this.shifts.find((s) => s.shiftId === shiftId);
    if (!shift) {
      throw new NotFoundException(`Shift with ID ${shiftId} not found`);
    }
    return shift;
  }

  private isRestDay(assignment: ShiftAssignment, date: Date): boolean {
    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const dayName = dayNames[date.getDay()];
    return assignment.restDays.includes(dayName);
  }

  private parseTime(timeString: string): { hours: number; minutes: number } {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
  }

  private createDateTimeFromShift(
    date: Date,
    timeString: string,
    isOvernightEnd: boolean = false,
  ): Date {
    const { hours, minutes } = this.parseTime(timeString);
    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes, 0, 0);

    if (isOvernightEnd) {
      dateTime.setDate(dateTime.getDate() + 1);
    }

    return dateTime;
  }

  private getDateOnly(date: Date): Date {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    return dateOnly;
  }

  async clockIn(clockInDto: ClockInDto): Promise<AttendanceDocument> {
    const timestamp = clockInDto.timestamp
      ? new Date(clockInDto.timestamp)
      : new Date();
    const dateOnly = this.getDateOnly(timestamp);

    this.getEmployee(clockInDto.employeeId);

    if (this.isTerminated(clockInDto.employeeId, dateOnly)) {
      throw new BadRequestException(
        'Cannot record attendance for terminated employee',
      );
    }

    if (this.isOnLeave(clockInDto.employeeId, dateOnly)) {
      throw new BadRequestException(
        'Cannot clock in/out while on approved leave',
      );
    }

    const assignment = this.getShiftAssignment(clockInDto.employeeId, dateOnly);

    if (this.isRestDay(assignment, dateOnly)) {
      throw new BadRequestException('Cannot clock in on rest day');
    }

    const existingAttendance = await this.attendanceModel
      .findOne({
        employeeId: clockInDto.employeeId,
        date: dateOnly,
      })
      .exec();

    if (existingAttendance && existingAttendance.clockIn) {
      throw new BadRequestException('Already clocked in for today');
    }

    const shift = this.getShift(assignment.shiftId);

    const shiftStartTime = this.createDateTimeFromShift(
      dateOnly,
      shift.startTime,
    );
    const effectiveStartTime = new Date(
      shiftStartTime.getTime() + shift.gracePeriodMinutes * 60000,
    );

    let status = 'present';
    let lateMinutes = 0;
    let notes = 'On time';

    if (timestamp > effectiveStartTime) {
      lateMinutes = Math.floor(
        (timestamp.getTime() - shiftStartTime.getTime()) / 60000,
      );
      status = 'late';
      notes = `Late by ${lateMinutes} minutes (grace period: ${shift.gracePeriodMinutes} minutes)`;
    }

    const attendanceData = {
      employeeId: clockInDto.employeeId,
      date: dateOnly,
      clockIn: timestamp,
      shiftId: assignment.shiftId,
      status,
      lateMinutes,
      shortTimeMinutes: 0,
      notes,
    };

    if (existingAttendance) {
      existingAttendance.clockIn = timestamp;
      existingAttendance.status = status;
      existingAttendance.lateMinutes = lateMinutes;
      existingAttendance.notes = notes;
      return await existingAttendance.save();
    }

    const attendance = new this.attendanceModel(attendanceData);
    return await attendance.save();
  }

  async clockOut(clockOutDto: ClockOutDto): Promise<AttendanceDocument> {
    const timestamp = clockOutDto.timestamp
      ? new Date(clockOutDto.timestamp)
      : new Date();
    const dateOnly = this.getDateOnly(timestamp);

    this.getEmployee(clockOutDto.employeeId);

    const attendance = await this.attendanceModel
      .findOne({
        employeeId: clockOutDto.employeeId,
        date: dateOnly,
      })
      .exec();

    if (!attendance || !attendance.clockIn) {
      throw new BadRequestException('Must clock in before clocking out');
    }

    if (attendance.clockOut) {
      throw new BadRequestException('Already clocked out for today');
    }

    const shift = this.getShift(attendance.shiftId);

    const isOvernightShift = shift.shiftType === 'overnight';
    const shiftEndTime = this.createDateTimeFromShift(
      dateOnly,
      shift.endTime,
      isOvernightShift,
    );

    attendance.clockOut = timestamp;

    let shortTimeMinutes = 0;
    let notes = attendance.notes || '';

    if (timestamp < shiftEndTime) {
      shortTimeMinutes = Math.floor(
        (shiftEndTime.getTime() - timestamp.getTime()) / 60000,
      );

      if (attendance.status !== 'late') {
        attendance.status = 'short-time';
        notes = `Left ${shortTimeMinutes} minutes early`;
      } else {
        notes = `${notes} | Left ${shortTimeMinutes} minutes early`;
      }
    } else {
      if (attendance.status === 'present') {
        notes = 'Completed full shift';
      }
    }

    attendance.shortTimeMinutes = shortTimeMinutes;
    attendance.notes = notes;

    return await attendance.save();
  }

}
