import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { OvertimeRuleService } from './overtime-rule.service';
import { CreateOvertimeRuleDto, UpdateOvertimeRuleDto } from './dto';
import { JwtAuthGuard, PermissionsGuard, Permissions, CurrentUser } from '../auth';
import { Permission } from '../auth';
import type { AuthUser } from '../auth';

@Controller('overtime-rules')
@UseGuards(JwtAuthGuard)
export class OvertimeRuleController {
    constructor(private readonly overtimeRuleService: OvertimeRuleService) { }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.MANAGE_ATTENDANCE)
    @Post()
    create(@Body() createOvertimeRuleDto: CreateOvertimeRuleDto, @CurrentUser() user: AuthUser) {
        return this.overtimeRuleService.createRule(createOvertimeRuleDto);
    }

    @Get()
    findAll(@CurrentUser() user: AuthUser) {
        return this.overtimeRuleService.getRules();
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
        return this.overtimeRuleService.getRuleById(id);
    }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.MANAGE_ATTENDANCE)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateOvertimeRuleDto: UpdateOvertimeRuleDto, @CurrentUser() user: AuthUser) {
        return this.overtimeRuleService.updateRule(id, updateOvertimeRuleDto);
    }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.MANAGE_ATTENDANCE)
    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
        return this.overtimeRuleService.deleteRule(id);
    }
}

