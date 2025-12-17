import { Test, TestingModule } from '@nestjs/testing';
import { DailyMemoryService } from './daily-memory.service';

describe('DailyMemoryService', () => {
  let service: DailyMemoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyMemoryService],
    }).compile();

    service = module.get<DailyMemoryService>(DailyMemoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
