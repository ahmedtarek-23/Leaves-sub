import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OvertimeRule, OvertimeRuleDocument } from './models/overtime-rule.schema';
import { CreateOvertimeRuleDto, UpdateOvertimeRuleDto } from './dto';

@Injectable()
export class OvertimeRuleService {
    constructor(
        @InjectModel(OvertimeRule.name) private overtimeRuleModel: Model<OvertimeRuleDocument>,
    ) { }

    async createRule(createOvertimeRuleDto: CreateOvertimeRuleDto): Promise<OvertimeRule> {
        const createdRule = new this.overtimeRuleModel(createOvertimeRuleDto);
        return createdRule.save();
    }

    async getRules(): Promise<OvertimeRule[]> {
        return this.overtimeRuleModel.find().exec();
    }

    async getRuleById(id: string): Promise<OvertimeRule> {
        const rule = await this.overtimeRuleModel.findById(id).exec();
        if (!rule) {
            throw new NotFoundException(`OvertimeRule with ID ${id} not found`);
        }
        return rule;
    }

    async updateRule(id: string, updateOvertimeRuleDto: UpdateOvertimeRuleDto): Promise<OvertimeRule> {
        const updatedRule = await this.overtimeRuleModel
            .findByIdAndUpdate(id, updateOvertimeRuleDto, { new: true })
            .exec();
        if (!updatedRule) {
            throw new NotFoundException(`OvertimeRule with ID ${id} not found`);
        }
        return updatedRule;
    }

    async deleteRule(id: string): Promise<void> {
        const result = await this.overtimeRuleModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`OvertimeRule with ID ${id} not found`);
        }
    }

    /**
     * Helper method to apply overtime rule logic to an attendance record
     * @param attendanceRecord - The attendance record with clock-out time
     * @param shift - The shift with end time
     * @param rule - The overtime rule to apply
     * @returns Object containing overtime calculation results
     */
    applyOvertimeRule(attendanceRecord: any, shift: any, rule: OvertimeRule): {
        hasOvertime: boolean;
        overtimeMinutes: number;
        isRuleActive: boolean;
        requiresApproval: boolean;
        isApproved: boolean;
        message: string;
    } {
        // Check if rule is active
        if (!rule.active) {
            return {
                hasOvertime: false,
                overtimeMinutes: 0,
                isRuleActive: false,
                requiresApproval: false,
                isApproved: false,
                message: 'Overtime rule is not active'
            };
        }

        // Extract clock-out time from attendance record
        const clockOutTime = attendanceRecord.clockOut || attendanceRecord.lastPunch;
        
        if (!clockOutTime) {
            return {
                hasOvertime: false,
                overtimeMinutes: 0,
                isRuleActive: true,
                requiresApproval: shift.requiresApprovalForOvertime || false,
                isApproved: rule.approved,
                message: 'No clock-out time found'
            };
        }

        // Parse shift end time (expected format: "HH:mm")
        const shiftEndTime = shift.endTime;
        if (!shiftEndTime) {
            return {
                hasOvertime: false,
                overtimeMinutes: 0,
                isRuleActive: true,
                requiresApproval: shift.requiresApprovalForOvertime || false,
                isApproved: rule.approved,
                message: 'No shift end time found'
            };
        }

        // Calculate minutes difference
        const clockOutDate = new Date(clockOutTime);
        const [hours, minutes] = shiftEndTime.split(':').map(Number);
        
        const shiftEndDate = new Date(clockOutDate);
        shiftEndDate.setHours(hours, minutes, 0, 0);

        const diffInMs = clockOutDate.getTime() - shiftEndDate.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

        const overtimeMinutes = Math.max(0, diffInMinutes);
        const hasOvertime = overtimeMinutes > 0;

        // Check if shift requires approval for overtime
        const requiresApproval = shift.requiresApprovalForOvertime || false;
        const isApproved = rule.approved;

        let message = '';
        if (!hasOvertime) {
            message = 'No overtime detected';
        } else if (requiresApproval && !isApproved) {
            message = `Employee worked ${overtimeMinutes} minutes overtime but requires approval`;
        } else if (requiresApproval && isApproved) {
            message = `Employee worked ${overtimeMinutes} minutes overtime (approved)`;
        } else {
            message = `Employee worked ${overtimeMinutes} minutes overtime`;
        }

        return {
            hasOvertime,
            overtimeMinutes,
            isRuleActive: true,
            requiresApproval,
            isApproved,
            message
        };
    }
}

