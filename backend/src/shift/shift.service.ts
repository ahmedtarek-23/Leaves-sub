import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Shift, ShiftDocument } from './schemas/shift.schema';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

@Injectable()
export class ShiftService {
  constructor(
    @InjectModel(Shift.name) private shiftModel: Model<ShiftDocument>,
  ) {}

  async create(dto: CreateShiftDto) {
    const created = new this.shiftModel(dto);
    return created.save();
  }

  async findAll() {
    return this.shiftModel.find().lean();
  }

  async findOne(id: string) {
    return this.shiftModel.findById(id).lean();
  }

  async update(id: string, dto: UpdateShiftDto) {
    return this.shiftModel.findByIdAndUpdate(id, dto, { new: true }).lean();
  }

  async remove(id: string) {
    return this.shiftModel.findByIdAndDelete(id).lean();
  }
}
