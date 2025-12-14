import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { refunds, refundsDocument } from '../models/refunds.schema';
import { CreateRefundDto } from '../dtos/create-refund.dto';
import { UpdateRefundDto } from '../dtos/update-refund.dto';

@Injectable()
export class RefundsService {
  constructor(
    @InjectModel(refunds.name)
    private readonly refundModel: Model<refundsDocument>,
  ) {}

  async create(createRefundDto: CreateRefundDto): Promise<refunds> {
    const refund = new this.refundModel(createRefundDto);
    return refund.save();
  }

  async findAll(): Promise<refunds[]> {
    return this.refundModel
      .find()
      .populate('claimId')
      .populate('disputeId')
      .populate('employeeId')
      .populate('financeStaffId')
      .populate('paidInPayrollRunId')
      .exec();
  }

  async findOne(id: string): Promise<refunds> {
    const refund = await this.refundModel
      .findById(id)
      .populate('claimId')
      .populate('disputeId')
      .populate('employeeId')
      .populate('financeStaffId')
      .populate('paidInPayrollRunId')
      .exec();

    if (!refund) {
      throw new NotFoundException(`Refund with id "${id}" not found`);
    }

    return refund;
  }

  async update(id: string, updateRefundDto: UpdateRefundDto): Promise<refunds> {
    const updated = await this.refundModel
      .findByIdAndUpdate(id, { $set: updateRefundDto }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Refund with id "${id}" not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.refundModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Refund with id "${id}" not found`);
    }
  }
}
