import { Test, TestingModule } from '@nestjs/testing';
import { ExceptionsController } from './exceptions.controller';
import { ExceptionsService } from './exceptions.service';

describe('ExceptionsController', () => {
  let controller: ExceptionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExceptionsController],
      providers: [ExceptionsService],
    }).compile();

    controller = module.get<ExceptionsController>(ExceptionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
