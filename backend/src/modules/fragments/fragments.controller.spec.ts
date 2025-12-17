import { Test, TestingModule } from '@nestjs/testing';
import { FragmentsController } from './fragments.controller';

describe('FragmentsController', () => {
  let controller: FragmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FragmentsController],
    }).compile();

    controller = module.get<FragmentsController>(FragmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
