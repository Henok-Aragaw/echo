import { Test, TestingModule } from '@nestjs/testing';
import { DailyMemoryController } from './daily-memory.controller';

describe('DailyMemoryController', () => {
  let controller: DailyMemoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyMemoryController],
    }).compile();

    controller = module.get<DailyMemoryController>(DailyMemoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
