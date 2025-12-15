import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Holiday, HolidayDocument } from './models/holiday.schema';
import { CreateHolidayDto, UpdateHolidayDto } from './dto';

@Injectable()
export class HolidayService {
    constructor(
        @InjectModel(Holiday.name) private holidayModel: Model<HolidayDocument>,
    ) { }

    async create(createHolidayDto: CreateHolidayDto): Promise<Holiday> {
        const createdHoliday = new this.holidayModel(createHolidayDto);
        return createdHoliday.save();
    }

    async findAll(): Promise<Holiday[]> {
        return this.holidayModel.find().exec();
    }

    async findOne(id: string): Promise<Holiday> {
        const holiday = await this.holidayModel.findById(id).exec();
        if (!holiday) {
            throw new NotFoundException(`Holiday with ID ${id} not found`);
        }
        return holiday;
    }

    async update(id: string, updateHolidayDto: UpdateHolidayDto): Promise<Holiday> {
        const updatedHoliday = await this.holidayModel
            .findByIdAndUpdate(id, updateHolidayDto, { new: true })
            .exec();
        if (!updatedHoliday) {
            throw new NotFoundException(`Holiday with ID ${id} not found`);
        }
        return updatedHoliday;
    }

    async remove(id: string): Promise<void> {
        const result = await this.holidayModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Holiday with ID ${id} not found`);
        }
    }
}
