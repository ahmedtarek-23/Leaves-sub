import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShiftAssignment, ShiftAssignmentDocument } from './models/shift-assignment.schema';
import { AssignShiftDto, UpdateShiftAssignmentDto } from './dto';
import { ShiftAssignmentStatus } from './models/enums';

@Injectable()
export class ShiftAssignmentService {
    constructor(
        @InjectModel(ShiftAssignment.name) private shiftAssignmentModel: Model<ShiftAssignmentDocument>,
    ) { }

    async assignShift(assignShiftDto: AssignShiftDto): Promise<ShiftAssignment> {
        // Basic validation logic could go here (e.g., check if employee already has a shift in this period)
        // For now, we just create the assignment
        const createdAssignment = new this.shiftAssignmentModel({
            ...assignShiftDto,
            status: ShiftAssignmentStatus.PENDING, // Default status
        });
        return createdAssignment.save();
    }

    async findMyShifts(employeeId: string): Promise<ShiftAssignment[]> {
        return this.shiftAssignmentModel.find({ employeeId }).exec();
    }

    async findAll(): Promise<ShiftAssignment[]> {
        return this.shiftAssignmentModel.find().exec();
    }

    async findOne(id: string): Promise<ShiftAssignment> {
        const assignment = await this.shiftAssignmentModel.findById(id).exec();
        if (!assignment) {
            throw new NotFoundException(`ShiftAssignment with ID ${id} not found`);
        }
        return assignment;
    }

    async update(id: string, updateShiftAssignmentDto: UpdateShiftAssignmentDto): Promise<ShiftAssignment> {
        const updatedAssignment = await this.shiftAssignmentModel
            .findByIdAndUpdate(id, updateShiftAssignmentDto, { new: true })
            .exec();
        if (!updatedAssignment) {
            throw new NotFoundException(`ShiftAssignment with ID ${id} not found`);
        }
        return updatedAssignment;
    }

    // Placeholder for renewal/expiry detection
    async checkExpiry(): Promise<void> {
        // Logic to find expired shifts and update their status
        const now = new Date();
        await this.shiftAssignmentModel.updateMany(
            { endDate: { $lt: now }, status: { $ne: ShiftAssignmentStatus.EXPIRED } },
            { status: ShiftAssignmentStatus.EXPIRED }
        ).exec();
    }
}
