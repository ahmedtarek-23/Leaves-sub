import { Controller, Get, Post, Body } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { CreateTemplateDto, CreateEvaluationDto, SubmitDisputeDto } from './dto';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly service: PerformanceService) {}

  @Post('template')
  createTemplate(@Body() dto: CreateTemplateDto) {
    return this.service.createTemplate(dto);
  }

  @Post('evaluation')
  createEvaluation(@Body() dto: CreateEvaluationDto) {
    return this.service.createEvaluation(dto);
  }

  @Post('dispute')
  submitDispute(@Body() dto: SubmitDisputeDto) {
    return this.service.submitDispute(dto);
  }

  @Get('evaluations')
  getEvaluations() {
    return this.service.getEvaluations();
  }

  @Get('disputes')
  getDisputes() {
    return this.service.getDisputes();
  }
}
