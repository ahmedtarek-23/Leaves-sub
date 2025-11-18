import { Injectable } from '@nestjs/common';
import { Evaluation, EvaluationDocument } from './schema/evaluation.schema';
import { Template, TemplateDocument } from './schema/template.schema';
import { Dispute, DisputeDocument } from './schema/dispute.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  CreateTemplateDto,
  CreateEvaluationDto,
  SubmitDisputeDto,
} from './dto';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectModel(Template.name) private templateModel: Model<TemplateDocument>,
    @InjectModel(Evaluation.name)
    private evaluationModel: Model<EvaluationDocument>,
    @InjectModel(Dispute.name) private disputeModel: Model<DisputeDocument>,
  ) {}

  async createTemplate(dto: CreateTemplateDto) {
    const template = new this.templateModel(dto);
    return template.save();
  }

  async createEvaluation(dto: CreateEvaluationDto) {
    const evaluation = new this.evaluationModel(dto);
    return evaluation.save();
  }

  async submitDispute(dto: SubmitDisputeDto) {
    const dispute = new this.disputeModel({ ...dto, status: 'Open' });
    return dispute.save();
  }

  async getEvaluations() {
    return this.evaluationModel.find().populate('templateId');
  }

  async getDisputes() {
    return this.disputeModel.find().populate('evaluationId');
  }
}
