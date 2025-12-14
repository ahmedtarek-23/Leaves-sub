import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { CreateHolidayDto, UpdateHolidayDto } from './dto';
import { JwtAuthGuard, PermissionsGuard, Permissions, CurrentUser } from '../auth';
import { Permission } from '../auth';
import type { AuthUser } from '../auth';

@Controller('holidays')
@UseGuards(JwtAuthGuard)
export class HolidayController {
    constructor(private readonly holidayService: HolidayService) { }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.MANAGE_ATTENDANCE)
    @Post()
    create(@Body() createHolidayDto: CreateHolidayDto, @CurrentUser() user: AuthUser) {
        return this.holidayService.create(createHolidayDto);
    }

    @Get()
    findAll(@CurrentUser() user: AuthUser) {
        return this.holidayService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
        return this.holidayService.findOne(id);
    }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.MANAGE_ATTENDANCE)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateHolidayDto: UpdateHolidayDto, @CurrentUser() user: AuthUser) {
        return this.holidayService.update(id, updateHolidayDto);
    }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.MANAGE_ATTENDANCE)
    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
        return this.holidayService.remove(id);
    }
}
