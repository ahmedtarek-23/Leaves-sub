import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ScheduleRuleService } from './schedule-rule.service';
import { CreateScheduleRuleDto, UpdateScheduleRuleDto } from './dto';
import { JwtAuthGuard, PermissionsGuard, Permissions, CurrentUser } from '../auth';
import { Permission } from '../auth';
import type { AuthUser } from '../auth';

@Controller('schedule-rules')
@UseGuards(JwtAuthGuard)
export class ScheduleRuleController {
    constructor(private readonly scheduleRuleService: ScheduleRuleService) { }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.MANAGE_ATTENDANCE)
    @Post()
    create(@Body() createScheduleRuleDto: CreateScheduleRuleDto, @CurrentUser() user: AuthUser) {
        return this.scheduleRuleService.create(createScheduleRuleDto);
    }

    @Get()
    findAll(@CurrentUser() user: AuthUser) {
        return this.scheduleRuleService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
        return this.scheduleRuleService.findOne(id);
    }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.MANAGE_ATTENDANCE)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateScheduleRuleDto: UpdateScheduleRuleDto, @CurrentUser() user: AuthUser) {
        return this.scheduleRuleService.update(id, updateScheduleRuleDto);
    }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.MANAGE_ATTENDANCE)
    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
        return this.scheduleRuleService.remove(id);
    }
}
