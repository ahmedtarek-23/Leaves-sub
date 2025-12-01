import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Shift, ShiftDocument } from './models/shift.schema';
import { CreateShiftDto, UpdateShiftDto } from './dto';

@Injectable()
export class ShiftService {
    constructor(
        @InjectModel(Shift.name) private shiftModel: Model<ShiftDocument>,
    ) { }

    async create(createShiftDto: CreateShiftDto): Promise<Shift> {
        const createdShift = new this.shiftModel(createShiftDto);
        return createdShift.save();
    }

    async findAll(): Promise<Shift[]> {
        return this.shiftModel.find().exec();
    }

    async findOne(id: string): Promise<Shift> {
        const shift = await this.shiftModel.findById(id).exec();
        if (!shift) {
            throw new NotFoundException(`Shift with ID ${id} not found`);
        }
        return shift;
    }

    async update(id: string, updateShiftDto: UpdateShiftDto): Promise<Shift> {
        const updatedShift = await this.shiftModel
            .findByIdAndUpdate(id, updateShiftDto, { new: true })
            .exec();
        if (!updatedShift) {
            throw new NotFoundException(`Shift with ID ${id} not found`);
        }
        return updatedShift;
    }

    async remove(id: string): Promise<void> {
        const result = await this.shiftModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Shift with ID ${id} not found`);
        }
    }
}
