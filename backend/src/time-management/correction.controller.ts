import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CorrectionService } from './correction.service';
import { CreateCorrectionDto } from './dto';
import { JwtAuthGuard, PermissionsGuard, Permissions, CurrentUser } from '../auth';
import { Permission } from '../auth';
import type { AuthUser } from '../auth';

@Controller('attendance/corrections')
@UseGuards(JwtAuthGuard)
export class CorrectionController {
    constructor(private readonly correctionService: CorrectionService) { }

    @Post()
    create(@Body() createCorrectionDto: CreateCorrectionDto, @CurrentUser() user: AuthUser) {
        return this.correctionService.createRequest(createCorrectionDto);
    }

    @Get()
    findAll(@CurrentUser() user: AuthUser) {
        return this.correctionService.getCorrectionRequests();
    }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.APPROVE_LEAVES, Permission.VIEW_TEAM_ATTENDANCE)
    @Patch(':id/manager')
    approveByManager(@Param('id') id: string, @CurrentUser() user: AuthUser) {
        return this.correctionService.approveByManager(id);
    }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.MANAGE_ATTENDANCE)
    @Patch(':id/hr')
    approveByHR(@Param('id') id: string, @CurrentUser() user: AuthUser) {
        return this.correctionService.approveByHR(id);
    }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.MANAGE_ATTENDANCE, Permission.APPROVE_LEAVES)
    @Patch(':id/reject')
    reject(@Param('id') id: string, @CurrentUser() user: AuthUser) {
        return this.correctionService.reject(id);
    }
}

