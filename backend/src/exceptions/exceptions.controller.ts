import { Controller, Post, Body, Patch, Param, Get } from '@nestjs/common';
import { ExceptionsService } from './exceptions.service';
import { CreateExceptionDto } from './dto/create-exception.dto';

@Controller('exceptions')
export class ExceptionsController {
  constructor(private readonly exceptionsService: ExceptionsService) {}

  // Overtime
  @Post('overtime')
  requestOvertime(@Body() body: any) {
    return this.exceptionsService.requestException({
      employeeId: body.employeeId,
      type: 'OVERTIME',
      reason: body.reason,
      value: body.hours,
    });
  }

  // Permission
  @Post('permission')
  requestPermission(@Body() body: any) {
    return this.exceptionsService.requestException({
      employeeId: body.employeeId,
      type: 'PERMISSION',
      reason: body.reason,
    });
  }

  // Attendance Correction
  @Post('correction')
  requestCorrection(@Body() body: any) {
    return this.exceptionsService.requestException({
      employeeId: body.employeeId,
      type: 'CORRECTION',
      reason: body.reason,
    });
  }

  // Approve Request
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.exceptionsService.approve(id);
  }

  // Get Pending Exceptions
  @Get('pending')
  getPending() {
    return this.exceptionsService.getPending();
  }
}
