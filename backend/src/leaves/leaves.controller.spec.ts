import { Test, TestingModule } from '@nestjs/testing';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';

const mockLeavesService = {
  submitRequest: jest.fn(),
  getEmployeeBalance: jest.fn(),
  processReview: jest.fn(),
  createPolicy: jest.fn(),
  manualAdjustBalance: jest.fn(),
  getIrregularLeaveReport: jest.fn(),
  assignVacationPackage: jest.fn(),
  createHoliday: jest.fn(),
  createLeaveType: jest.fn(),
  getLeaveTypes: jest.fn(),
  updateLeaveType: jest.fn(),
  createApprovalWorkflow: jest.fn(),
  encashLeave: jest.fn(),
  getRequestsByEmployee: jest.fn(),
  getTeamLeaves: jest.fn(),
  modifyRequest: jest.fn(),
  cancelRequest: jest.fn(),
  delegateApproval: jest.fn(),
};

describe('LeavesController', () => {
  let controller: LeavesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeavesController],
      providers: [{ provide: LeavesService, useValue: mockLeavesService }],
    }).compile();

    controller = module.get<LeavesController>(LeavesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
