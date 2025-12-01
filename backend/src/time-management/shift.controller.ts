import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ShiftService } from './shift.service';
import { CreateShiftDto, UpdateShiftDto } from './dto';
import { JwtAuthGuard, PermissionsGuard, Permissions, CurrentUser } from '../auth';
import { Permission } from '../auth';
import type { AuthUser } from '../auth';

@Controller('shift-definitions')
@UseGuards(JwtAuthGuard)
export class ShiftController {
    constructor(private readonly shiftService: ShiftService) { }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.MANAGE_ATTENDANCE)
    @Post()
    create(@Body() createShiftDto: CreateShiftDto, @CurrentUser() user: AuthUser) {
        return this.shiftService.create(createShiftDto);
    }

    @Get()
    findAll(@CurrentUser() user: AuthUser) {
        return this.shiftService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
        return this.shiftService.findOne(id);
    }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.MANAGE_ATTENDANCE)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateShiftDto: UpdateShiftDto, @CurrentUser() user: AuthUser) {
        return this.shiftService.update(id, updateShiftDto);
    }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.MANAGE_ATTENDANCE)
    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
        return this.shiftService.remove(id);
    }
}
