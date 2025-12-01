import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { disputes, disputesDocument } from '../models/disputes.schema';
import { CreateDisputeDto } from '../dtos/create-dispute.dto';
import { UpdateDisputeDto } from '../dtos/update-dispute.dto';

@Injectable()
export class DisputesService {
  constructor(
    @InjectModel(disputes.name)
    private readonly disputeModel: Model<disputesDocument>,
  ) {}

  async create(createDisputeDto: CreateDisputeDto): Promise<disputes> {
    const dispute = new this.disputeModel(createDisputeDto);
    return dispute.save();
  }

  async findAll(): Promise<disputes[]> {
    return this.disputeModel
      .find()
      .populate('employeeId')
      .populate('financeStaffId')
      .populate('payslipId')
      .exec();
  }

  async findOne(id: string): Promise<disputes> {
    const dispute = await this.disputeModel
      .findById(id)
      .populate('employeeId')
      .populate('financeStaffId')
      .populate('payslipId')
      .exec();

    if (!dispute) {
      throw new NotFoundException(`Dispute with id "${id}" not found`);
    }

    return dispute;
  }

  async findByDisputeId(disputeId: string): Promise<disputes> {
    const dispute = await this.disputeModel
      .findOne({ disputeId })
      .populate('employeeId')
      .populate('financeStaffId')
      .populate('payslipId')
      .exec();

    if (!dispute) {
      throw new NotFoundException(`Dispute with disputeId "${disputeId}" not found`);
    }

    return dispute;
  }

  async update(id: string, updateDisputeDto: UpdateDisputeDto): Promise<disputes> {
    const updated = await this.disputeModel
      .findByIdAndUpdate(id, { $set: updateDisputeDto }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Dispute with id "${id}" not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.disputeModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Dispute with id "${id}" not found`);
    }
  }
}