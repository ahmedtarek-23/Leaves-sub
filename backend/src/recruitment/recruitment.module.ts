import { Module } from '@nestjs/common';
import { RecruitmentController } from './recruitment.controller';
import { RecruitmentService } from './recruitment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JobRequisitionSchema } from './schemas/job-requisition.schema';
import { CandidateSchema } from './schemas/candidate.schema';
import { ApplicationSchema } from './schemas/application.schema';
import { InterviewSchema } from './schemas/interview.schema';
import { OfferSchema } from './schemas/offer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'JobRequisition', schema: JobRequisitionSchema },
      { name: 'Candidate', schema: CandidateSchema },
      { name: 'Application', schema: ApplicationSchema },
      { name: 'Interview', schema: InterviewSchema },
      { name: 'Offer', schema: OfferSchema },
    ]),
  ],
  controllers: [RecruitmentController],
  providers: [RecruitmentService],
  exports: [RecruitmentService],
})
export class RecruitmentModule {}