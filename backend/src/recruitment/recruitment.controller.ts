import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';
import { CreateJobRequisitionDto } from './dto/create-job-requisition.dto';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { CreateApplicationDto } from './dto/create-application.dto';

@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  // Job Requisition Endpoints
  @Post('job-requisitions')
  createJobRequisition(@Body() dto: CreateJobRequisitionDto) {
    return this.recruitmentService.createJobRequisition(dto);
  }

  @Get('job-requisitions')
  findAllJobRequisitions() {
    return this.recruitmentService.findAllJobRequisitions();
  }

  // Candidate Endpoints
  @Post('candidates')
  createCandidate(@Body() dto: CreateCandidateDto) {
    return this.recruitmentService.createCandidate(dto);
  }

  @Get('candidates')
  findAllCandidates() {
    return this.recruitmentService.findAllCandidates();
  }

  // Application Endpoints
  @Post('applications')
  createApplication(@Body() dto: CreateApplicationDto) {
    return this.recruitmentService.createApplication(dto);
  }

  @Put('applications/:id/status')
  updateApplicationStatus(@Param('id') id: string, @Body() dto: any) {
    return this.recruitmentService.updateApplicationStatus(id, dto);
  }

  // Analytics Endpoint
  @Get('analytics')
  getAnalytics() {
    return this.recruitmentService.getRecruitmentAnalytics();
  }
}