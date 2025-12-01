import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth';

@Controller('time-management')
@UseGuards(JwtAuthGuard)
export class TimeManagementController {}
