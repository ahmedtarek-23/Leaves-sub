import { Controller, Post, Body, Param, Get, Delete } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { AssignShiftDto } from './dto/assign-shift.dto';

@Controller('assignments')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Post()
  assign(@Body() dto: AssignShiftDto) {
    return this.assignmentService.assignShift(dto);
  }

  @Get('employee/:id')
  getAssignments(@Param('id') employeeId: string) {
    return this.assignmentService.findAssignmentsForEmployee(employeeId);
  }

  @Delete(':id')
  deleteAssignment(@Param('id') id: string) {
    return this.assignmentService.removeAssignment(id);
  }
}
