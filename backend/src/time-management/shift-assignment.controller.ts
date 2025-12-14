import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ShiftAssignmentService } from './shift-assignment.service';
import { AssignShiftDto, UpdateShiftAssignmentDto } from './dto';
import { JwtAuthGuard, PermissionsGuard, Permissions, CurrentUser } from '../auth';
import { Permission } from '../auth';
import type { AuthUser } from '../auth';

@Controller('shifts')
@UseGuards(JwtAuthGuard)
export class ShiftAssignmentController {
    constructor(private readonly shiftAssignmentService: ShiftAssignmentService) { }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.MANAGE_ATTENDANCE)
    @Post('assign')
    assignShift(@Body() assignShiftDto: AssignShiftDto, @CurrentUser() user: AuthUser) {
        return this.shiftAssignmentService.assignShift(assignShiftDto);
    }

    @Get('my')
    findMyShifts(@Query('employeeId') employeeId: string, @CurrentUser() user: AuthUser) {
        // In a real app, employeeId would come from the JWT token
        return this.shiftAssignmentService.findMyShifts(employeeId);
    }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.VIEW_TEAM_ATTENDANCE, Permission.MANAGE_ATTENDANCE)
    @Get()
    findAll(@CurrentUser() user: AuthUser) {
        return this.shiftAssignmentService.findAll();
    }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.VIEW_TEAM_ATTENDANCE, Permission.MANAGE_ATTENDANCE)
    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
        return this.shiftAssignmentService.findOne(id);
    }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.MANAGE_ATTENDANCE)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateShiftAssignmentDto: UpdateShiftAssignmentDto, @CurrentUser() user: AuthUser) {
        return this.shiftAssignmentService.update(id, updateShiftAssignmentDto);
    }
}
