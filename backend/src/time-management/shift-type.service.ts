import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShiftType, ShiftTypeDocument } from './models/shift-type.schema';
import { CreateShiftTypeDto, UpdateShiftTypeDto } from './dto';

@Injectable()
export class ShiftTypeService {
    constructor(
        @InjectModel(ShiftType.name) private shiftTypeModel: Model<ShiftTypeDocument>,
    ) { }

    async create(createShiftTypeDto: CreateShiftTypeDto): Promise<ShiftType> {
        const createdShiftType = new this.shiftTypeModel(createShiftTypeDto);
        return createdShiftType.save();
    }

    async findAll(): Promise<ShiftType[]> {
        return this.shiftTypeModel.find().exec();
    }

    async findOne(id: string): Promise<ShiftType> {
        const shiftType = await this.shiftTypeModel.findById(id).exec();
        if (!shiftType) {
            throw new NotFoundException(`ShiftType with ID ${id} not found`);
        }
        return shiftType;
    }

    async update(id: string, updateShiftTypeDto: UpdateShiftTypeDto): Promise<ShiftType> {
        const updatedShiftType = await this.shiftTypeModel
            .findByIdAndUpdate(id, updateShiftTypeDto, { new: true })
            .exec();
        if (!updatedShiftType) {
            throw new NotFoundException(`ShiftType with ID ${id} not found`);
        }
        return updatedShiftType;
    }

    async remove(id: string): Promise<void> {
        const result = await this.shiftTypeModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`ShiftType with ID ${id} not found`);
        }
    }
}
