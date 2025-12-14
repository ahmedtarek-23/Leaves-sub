import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LatenessRule, LatenessRuleDocument } from './models/lateness-rule.schema';
import { CreateLatenessRuleDto, UpdateLatenessRuleDto } from './dto';

@Injectable()
export class LatenessRuleService {
    constructor(
        @InjectModel(LatenessRule.name) private latenessRuleModel: Model<LatenessRuleDocument>,
    ) { }

    async createRule(createLatenessRuleDto: CreateLatenessRuleDto): Promise<LatenessRule> {
        const createdRule = new this.latenessRuleModel(createLatenessRuleDto);
        return createdRule.save();
    }

    async getRules(): Promise<LatenessRule[]> {
        return this.latenessRuleModel.find().exec();
    }

    async getRuleById(id: string): Promise<LatenessRule> {
        const rule = await this.latenessRuleModel.findById(id).exec();
        if (!rule) {
            throw new NotFoundException(`LatenessRule with ID ${id} not found`);
        }
        return rule;
    }

    async updateRule(id: string, updateLatenessRuleDto: UpdateLatenessRuleDto): Promise<LatenessRule> {
        const updatedRule = await this.latenessRuleModel
            .findByIdAndUpdate(id, updateLatenessRuleDto, { new: true })
            .exec();
        if (!updatedRule) {
            throw new NotFoundException(`LatenessRule with ID ${id} not found`);
        }
        return updatedRule;
    }

    async deleteRule(id: string): Promise<void> {
        const result = await this.latenessRuleModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`LatenessRule with ID ${id} not found`);
        }
    }

    /**
     * Helper method to apply lateness rule logic to an attendance record
     * @param attendanceRecord - The attendance record with clock-in time
     * @param shift - The shift with start time and grace period
     * @param rule - The lateness rule to apply
     * @returns Object containing lateness calculation results
     */
    applyLatenessRule(attendanceRecord: any, shift: any, rule: LatenessRule): {
        isLate: boolean;
        minutesLate: number;
        deduction: number;
        gracePeriodApplied: number;
        message: string;
    } {
        // Extract clock-in time from attendance record
        const clockInTime = attendanceRecord.clockIn || attendanceRecord.firstPunch;
        
        if (!clockInTime) {
            return {
                isLate: false,
                minutesLate: 0,
                deduction: 0,
                gracePeriodApplied: 0,
                message: 'No clock-in time found'
            };
        }

        // Parse shift start time (expected format: "HH:mm")
        const shiftStartTime = shift.startTime;
        if (!shiftStartTime) {
            return {
                isLate: false,
                minutesLate: 0,
                deduction: 0,
                gracePeriodApplied: 0,
                message: 'No shift start time found'
            };
        }

        // Calculate minutes difference
        const clockInDate = new Date(clockInTime);
        const [hours, minutes] = shiftStartTime.split(':').map(Number);
        
        const shiftStartDate = new Date(clockInDate);
        shiftStartDate.setHours(hours, minutes, 0, 0);

        const diffInMs = clockInDate.getTime() - shiftStartDate.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

        // Apply grace period from rule
        const gracePeriod = rule.gracePeriodMinutes || 0;
        const minutesLateAfterGrace = Math.max(0, diffInMinutes - gracePeriod);

        // Calculate deduction
        const deduction = minutesLateAfterGrace * (rule.deductionForEachMinute || 0);

        const isLate = minutesLateAfterGrace > 0;

        return {
            isLate,
            minutesLate: Math.max(0, diffInMinutes),
            deduction,
            gracePeriodApplied: gracePeriod,
            message: isLate 
                ? `Employee was ${minutesLateAfterGrace} minutes late after grace period. Deduction: ${deduction}`
                : diffInMinutes > 0 
                    ? `Employee was ${diffInMinutes} minutes late but within grace period`
                    : 'Employee clocked in on time'
        };
    }
}

