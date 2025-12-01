import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { LatenessRuleService } from './lateness-rule.service';
import { CreateLatenessRuleDto, UpdateLatenessRuleDto } from './dto';
import { JwtAuthGuard, PermissionsGuard, Permissions, CurrentUser } from '../auth';
import { Permission } from '../auth';
import type { AuthUser } from '../auth';

@Controller('lateness-rules')
@UseGuards(JwtAuthGuard)
export class LatenessRuleController {
    constructor(private readonly latenessRuleService: LatenessRuleService) { }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.MANAGE_ATTENDANCE)
    @Post()
    create(@Body() createLatenessRuleDto: CreateLatenessRuleDto, @CurrentUser() user: AuthUser) {
        return this.latenessRuleService.createRule(createLatenessRuleDto);
    }

    @Get()
    findAll(@CurrentUser() user: AuthUser) {
        return this.latenessRuleService.getRules();
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
        return this.latenessRuleService.getRuleById(id);
    }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.MANAGE_ATTENDANCE)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateLatenessRuleDto: UpdateLatenessRuleDto, @CurrentUser() user: AuthUser) {
        return this.latenessRuleService.updateRule(id, updateLatenessRuleDto);
    }

    @UseGuards(PermissionsGuard)
    @Permissions(Permission.MANAGE_ATTENDANCE)
    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
        return this.latenessRuleService.deleteRule(id);
    }
}

