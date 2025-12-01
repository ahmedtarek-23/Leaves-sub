import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ShiftTypeService } from './shift-type.service';
import { CreateShiftTypeDto, UpdateShiftTypeDto } from './dto';
import { JwtAuthGuard, PermissionsGuard, Permissions, CurrentUser } from '../auth';
import { Permission } from '../auth';
import type { AuthUser } from '../auth';

@Controller('shift-types')
@UseGuards(JwtAuthGuard)
export class ShiftTypeController {
    constructor(private readonly shiftTypeService: ShiftTypeService) { }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.MANAGE_ATTENDANCE)
    @Post()
    create(@Body() createShiftTypeDto: CreateShiftTypeDto, @CurrentUser() user: AuthUser) {
        return this.shiftTypeService.create(createShiftTypeDto);
    }

    @Get()
    findAll(@CurrentUser() user: AuthUser) {
        return this.shiftTypeService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
        return this.shiftTypeService.findOne(id);
    }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.MANAGE_ATTENDANCE)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateShiftTypeDto: UpdateShiftTypeDto, @CurrentUser() user: AuthUser) {
        return this.shiftTypeService.update(id, updateShiftTypeDto);
    }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.MANAGE_ATTENDANCE)
    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
        return this.shiftTypeService.remove(id);
    }
}
