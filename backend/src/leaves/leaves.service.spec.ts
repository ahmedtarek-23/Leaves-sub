import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { LeavesService } from './leaves.service';
import { LeaveRequest } from './models/leave-request.schema';
import { LeaveType } from './models/leave-type.schema';
import { LeavePolicy } from './models/leave-policy.schema';
import { LeaveEntitlement } from './models/leave-entitlement.schema';
import { LeaveAdjustment } from './models/leave-adjustment.schema';
import { Calendar } from './models/calendar.schema';
import { Holiday } from './models/holiday.schema';
import { VacationPackage } from './models/vacation-package.schema';
import { ApprovalWorkflow } from './models/approval-workflow.schema';
import { LeaveEncashment } from './models/leave-encashment.schema';

describe('LeavesService', () => {
  let service: LeavesService;

  beforeEach(async () => {
    const mockModel = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      findById: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({}),
      updateOne: jest.fn().mockResolvedValue({}),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeavesService,
        { provide: getModelToken(LeaveRequest.name), useValue: mockModel },
        { provide: getModelToken(LeaveType.name), useValue: mockModel },
        { provide: getModelToken(LeavePolicy.name), useValue: mockModel },
        { provide: getModelToken(LeaveEntitlement.name), useValue: mockModel },
        { provide: getModelToken(LeaveAdjustment.name), useValue: mockModel },
        { provide: getModelToken(Calendar.name), useValue: mockModel },
        { provide: getModelToken(Holiday.name), useValue: mockModel },
        { provide: getModelToken(VacationPackage.name), useValue: mockModel },
        { provide: getModelToken(ApprovalWorkflow.name), useValue: mockModel },
        { provide: getModelToken(LeaveEncashment.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get<LeavesService>(LeavesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
