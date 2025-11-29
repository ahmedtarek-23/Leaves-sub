import { Test, TestingModule } from '@nestjs/testing';
<<<<<<<< HEAD:backend/src/recruitment/recruitment.service.spec.ts
import { RecruitmentService } from './recruitment.service';

describe('RecruitmentService', () => {
  let service: RecruitmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecruitmentService],
    }).compile();

    service = module.get<RecruitmentService>(RecruitmentService);
========
import { LeavesService } from './leaves.service';

describe('LeavesService', () => {
  let service: LeavesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeavesService],
    }).compile();

    service = module.get<LeavesService>(LeavesService);
>>>>>>>> origin/main:backend/src/leaves/leaves.service.spec.ts
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
