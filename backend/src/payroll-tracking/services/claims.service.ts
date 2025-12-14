import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { claims, claimsDocument } from '../models/claims.schema';   
import { CreateClaimDto } from '../dtos/create-claim.dto';
import { UpdateClaimDto } from '../dtos/update-claim.dto';

@Injectable()
export class ClaimsService {
  constructor(
    @InjectModel(claims.name)
    private readonly claimModel: Model<claimsDocument>,
  ) {}

  async create(createClaimDto: CreateClaimDto): Promise<claims> {
    const created = new this.claimModel({
      ...createClaimDto,
      employeeId: createClaimDto.employeeId,
      financeStaffId: createClaimDto.financeStaffId ?? undefined,
    });

    return created.save();
  }

  async findAll(): Promise<claims[]> {
    return this.claimModel
      .find()
      .populate('employeeId')
      .populate('financeStaffId')
      .exec();
  }

  async findOne(id: string): Promise<claims> {
    const claim = await this.claimModel
      .findById(id)
      .populate('employeeId')
      .populate('financeStaffId')
      .exec();

    if (!claim) {
      throw new NotFoundException(`Claim with id "${id}" not found`);
    }

    return claim;
  }

  // Optional: find by business claimId (CLAIM-0001)
  async findByClaimId(claimId: string): Promise<claims> {
    const claim = await this.claimModel
      .findOne({ claimId })
      .populate('employeeId')
      .populate('financeStaffId')
      .exec();

    if (!claim) {
      throw new NotFoundException(`Claim with claimId "${claimId}" not found`);
    }

    return claim;
  }

  async update(id: string, updateClaimDto: UpdateClaimDto): Promise<claims> {
    const updated = await this.claimModel
      .findByIdAndUpdate(id, { $set: updateClaimDto }, { new: true })
      .populate('employeeId')
      .populate('financeStaffId')
      .exec();

    if (!updated) {
      throw new NotFoundException(`Claim with id "${id}" not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.claimModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Claim with id "${id}" not found`);
    }
  }
}