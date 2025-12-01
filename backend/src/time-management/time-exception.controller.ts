import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { TimeExceptionService } from './time-exception.service';
import { CreateTimeExceptionDto, UpdateTimeExceptionDto } from './dto';
import { TimeExceptionStatus } from './models/enums';
import { JwtAuthGuard, PermissionsGuard, Permissions, CurrentUser } from '../auth';
import { Permission } from '../auth';
import type { AuthUser } from '../auth';

@Controller('exceptions')
@UseGuards(JwtAuthGuard)
export class TimeExceptionController {
    constructor(private readonly timeExceptionService: TimeExceptionService) { }

    @Post()
    create(@Body() createTimeExceptionDto: CreateTimeExceptionDto, @CurrentUser() user: AuthUser) {
        return this.timeExceptionService.createException(createTimeExceptionDto);
    }

    @Get()
    findAll(@CurrentUser() user: AuthUser) {
        return this.timeExceptionService.getExceptions();
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
        return this.timeExceptionService.getExceptionById(id);
    }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.APPROVE_LEAVES)
    @Patch(':id/approve')
    approve(@Param('id') id: string, @CurrentUser() user: AuthUser) {
        return this.timeExceptionService.updateExceptionStatus(id, TimeExceptionStatus.APPROVED);
    }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.APPROVE_LEAVES)
    @Patch(':id/reject')
    reject(@Param('id') id: string, @CurrentUser() user: AuthUser) {
        return this.timeExceptionService.updateExceptionStatus(id, TimeExceptionStatus.REJECTED);
    }
}

