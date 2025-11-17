import { Controller, Get, Param } from '@nestjs/common';
import { AvailabilityService } from './availability.service';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  // Get Availability by Employee ID
  @Get(':employeeId')
  getByEmployeeId(@Param('employeeId') employeeId: string) {
    return this.availabilityService.getByEmployeeId(employeeId);
  }
}
