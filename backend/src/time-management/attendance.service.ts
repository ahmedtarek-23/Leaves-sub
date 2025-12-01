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
import {
  AttendanceRecord,
  AttendanceRecordDocument,
  Punch,
} from './models/attendance-record.schema';
import { ClockInDto, ClockOutDto, CorrectionDto } from './dto/attendance.dto';
import { PunchType } from './models/enums/index';

interface Employee {
  employeeNumber: string;
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

export interface MonthlyReportSummary {
  employeeId: string;
  month: number;
  year: number;
  totalDays: number;
  present: number;
  late: number;
  absent: number;
  shortTime: number;
  totalLateMinutes: number;
  totalShortTimeMinutes: number;
  totalWorkMinutes: number;
  missedPunches: number;
}

@Injectable()
export class AttendanceService implements OnModuleInit {
  private employees: Employee[] = [];
  private leaves: Leave[] = [];
  private offboardings: Offboarding[] = [];
  private shifts: Shift[] = [];
  private shiftAssignments: ShiftAssignment[] = [];

  constructor(
    @InjectModel(AttendanceRecord.name)
    private attendanceModel: Model<AttendanceRecordDocument>,
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
    const employee = this.employees.find((e) => e.employeeNumber === employeeId);
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

  async clockIn(clockInDto: ClockInDto): Promise<AttendanceRecordDocument> {
    const timestamp = clockInDto.timestamp
      ? new Date(clockInDto.timestamp)
      : new Date();

    this.getEmployee(clockInDto.employeeId);

    if (this.isTerminated(clockInDto.employeeId, timestamp)) {
      throw new BadRequestException(
        'Cannot record attendance for terminated employee',
      );
    }

    if (this.isOnLeave(clockInDto.employeeId, timestamp)) {
      throw new BadRequestException(
        'Cannot clock in/out while on approved leave',
      );
    }

    const assignment = this.getShiftAssignment(clockInDto.employeeId, timestamp);

    if (this.isRestDay(assignment, timestamp)) {
      throw new BadRequestException('Cannot clock in on rest day');
    }

    const dateOnly = new Date(timestamp);
    dateOnly.setHours(0, 0, 0, 0);

    let attendanceRecord = await this.attendanceModel.findOne({
      employeeId: clockInDto.employeeId as any,
    });

    if (!attendanceRecord) {
      attendanceRecord = new this.attendanceModel({
        employeeId: clockInDto.employeeId,
        punches: [],
        totalWorkMinutes: 0,
        hasMissedPunch: false,
        exceptionIds: [],
        finalisedForPayroll: true,
      });
    }

    const clockInPunch: Punch = {
      type: PunchType.IN,
      time: timestamp,
    };

    attendanceRecord.punches.push(clockInPunch);

    attendanceRecord.hasMissedPunch = this.detectMissingPunch(
      attendanceRecord.punches,
    );

    return await attendanceRecord.save();
  }

  async clockOut(clockOutDto: ClockOutDto): Promise<AttendanceRecordDocument> {
    const timestamp = clockOutDto.timestamp
      ? new Date(clockOutDto.timestamp)
      : new Date();

    this.getEmployee(clockOutDto.employeeId);

    const attendanceRecord = await this.attendanceModel.findOne({
      employeeId: clockOutDto.employeeId as any,
    });

    if (!attendanceRecord || attendanceRecord.punches.length === 0) {
      throw new BadRequestException('Must clock in before clocking out');
    }

    const clockOutPunch: Punch = {
      type: PunchType.OUT,
      time: timestamp,
    };

    attendanceRecord.punches.push(clockOutPunch);

    const totalMinutes = this.calculateTotalWorkMinutes(
      attendanceRecord.punches,
    );
    attendanceRecord.totalWorkMinutes = totalMinutes;

    attendanceRecord.hasMissedPunch = this.detectMissingPunch(
      attendanceRecord.punches,
    );

    return await attendanceRecord.save();
  }

  async correctAttendance(
    id: string,
    correctionDto: CorrectionDto,
  ): Promise<AttendanceRecordDocument> {
    const attendanceRecord = await this.attendanceModel.findById(id);

    if (!attendanceRecord) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    if (correctionDto.clockIn) {
      const clockInTime = new Date(correctionDto.clockIn);
      const existingClockIn = attendanceRecord.punches.find(
        (p) => p.type === PunchType.IN,
      );

      if (existingClockIn) {
        existingClockIn.time = clockInTime;
      } else {
        attendanceRecord.punches.unshift({
          type: PunchType.IN,
          time: clockInTime,
        });
      }
    }

    if (correctionDto.clockOut) {
      const clockOutTime = new Date(correctionDto.clockOut);
      const existingClockOut = attendanceRecord.punches.find(
        (p) => p.type === PunchType.OUT,
      );

      if (existingClockOut) {
        existingClockOut.time = clockOutTime;
      } else {
        attendanceRecord.punches.push({
          type: PunchType.OUT,
          time: clockOutTime,
        });
      }
    }

    attendanceRecord.totalWorkMinutes = this.calculateTotalWorkMinutes(
      attendanceRecord.punches,
    );
    attendanceRecord.hasMissedPunch = this.detectMissingPunch(
      attendanceRecord.punches,
    );

    attendanceRecord.markModified('punches');

    return await attendanceRecord.save();
  }

  async getDailyReport(date: Date): Promise<AttendanceRecordDocument[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.attendanceModel
      .find({
        'punches.time': {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
      .exec();
  }

  async getMonthlyReport(
    employeeId: string,
    month: number,
    year: number,
  ): Promise<MonthlyReportSummary> {
    this.getEmployee(employeeId);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const records = await this.attendanceModel
      .find({
        employeeId: employeeId as any,
        'punches.time': {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .exec();

    let totalWorkMinutes = 0;
    let missedPunches = 0;

    records.forEach((record) => {
      totalWorkMinutes += record.totalWorkMinutes || 0;
      if (record.hasMissedPunch) {
        missedPunches++;
      }
    });

    return {
      employeeId,
      month,
      year,
      totalDays: records.length,
      present: records.filter((r) => !r.hasMissedPunch).length,
      late: 0,
      absent: 0,
      shortTime: 0,
      totalLateMinutes: 0,
      totalShortTimeMinutes: 0,
      totalWorkMinutes,
      missedPunches,
    };
  }

  private calculateTotalWorkMinutes(punches: Punch[]): number {
    let totalMinutes = 0;
    let clockInTime: Date | null = null;

    for (const punch of punches) {
      if (punch.type === PunchType.IN) {
        clockInTime = punch.time;
      } else if (punch.type === PunchType.OUT && clockInTime) {
        const diffMs = punch.time.getTime() - clockInTime.getTime();
        totalMinutes += Math.floor(diffMs / 60000);
        clockInTime = null;
      }
    }

    return totalMinutes;
  }

  private detectMissingPunch(punches: Punch[]): boolean {
    if (punches.length === 0) return false;

    const clockInCount = punches.filter((p) => p.type === PunchType.IN)
      .length;
    const clockOutCount = punches.filter((p) => p.type === PunchType.OUT)
      .length;

    return clockInCount !== clockOutCount;
  }
}
