import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TerminationRequest,
  TerminationRequestSchema,
} from '../recruitment/models/termination-request.schema';
import {
  ClearanceChecklist,
  ClearanceChecklistSchema,
} from '../recruitment/models/clearance-checklist.schema';
import { OffboardingController } from './offboarding.controller';
import { OffboardingService } from './offboarding.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TerminationRequest.name, schema: TerminationRequestSchema },
      { name: ClearanceChecklist.name, schema: ClearanceChecklistSchema },
    ]),
  ],
  controllers: [OffboardingController],
  providers: [OffboardingService],
  exports: [OffboardingService],
})
export class OffboardingModule {}