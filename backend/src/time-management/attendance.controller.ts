import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import {
  ClockInDto,
  ClockOutDto,
  CorrectionDto,
} from './dto/attendance.dto';

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

  @Patch('correction/:id')
  @HttpCode(HttpStatus.OK)
  async correctAttendance(
    @Param('id') id: string,
    @Body() correctionDto: CorrectionDto,
  ) {
    return await this.attendanceService.correctAttendance(id, correctionDto);
  }

  @Get('daily-report')
  async getDailyReport(@Query('date') date: string) {
    return await this.attendanceService.getDailyReport(new Date(date));
  }

  @Get('monthly-report')
  async getMonthlyReport(
    @Query('employeeId') employeeId: string,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return await this.attendanceService.getMonthlyReport(
      employeeId,
      month,
      year,
    );
  }
}
