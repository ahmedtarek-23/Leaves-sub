import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScheduleRule, ScheduleRuleDocument } from './models/schedule-rule.schema';
import { CreateScheduleRuleDto, UpdateScheduleRuleDto } from './dto';

@Injectable()
export class ScheduleRuleService {
    constructor(
        @InjectModel(ScheduleRule.name) private scheduleRuleModel: Model<ScheduleRuleDocument>,
    ) { }

    async create(createScheduleRuleDto: CreateScheduleRuleDto): Promise<ScheduleRule> {
        const createdScheduleRule = new this.scheduleRuleModel(createScheduleRuleDto);
        return createdScheduleRule.save();
    }

    async findAll(): Promise<ScheduleRule[]> {
        return this.scheduleRuleModel.find().exec();
    }

    async findOne(id: string): Promise<ScheduleRule> {
        const scheduleRule = await this.scheduleRuleModel.findById(id).exec();
        if (!scheduleRule) {
            throw new NotFoundException(`ScheduleRule with ID ${id} not found`);
        }
        return scheduleRule;
    }

    async update(id: string, updateScheduleRuleDto: UpdateScheduleRuleDto): Promise<ScheduleRule> {
        const updatedScheduleRule = await this.scheduleRuleModel
            .findByIdAndUpdate(id, updateScheduleRuleDto, { new: true })
            .exec();
        if (!updatedScheduleRule) {
            throw new NotFoundException(`ScheduleRule with ID ${id} not found`);
        }
        return updatedScheduleRule;
    }

    async remove(id: string): Promise<void> {
        const result = await this.scheduleRuleModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`ScheduleRule with ID ${id} not found`);
        }
    }
}
