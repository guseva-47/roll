import { Test, TestingModule } from '@nestjs/testing';
import { FormuleController } from './formule.controller';

describe('FormuleController', () => {
  let controller: FormuleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormuleController],
    }).compile();

    controller = module.get<FormuleController>(FormuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
