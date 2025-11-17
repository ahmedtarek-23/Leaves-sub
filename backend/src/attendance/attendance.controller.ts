import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('clock-in')
  @HttpCode(HttpStatus.CREATED)
  async clockIn(@Body() clockInDto: ClockInDto) {
    return await this.attendanceService.clockIn(clockInDto);
  }

  @Post('clock-out')
  @HttpCode(HttpStatus.OK)
  async clockOut(@Body() clockOutDto: ClockOutDto) {
    return await this.attendanceService.clockOut(clockOutDto);
  }
}
