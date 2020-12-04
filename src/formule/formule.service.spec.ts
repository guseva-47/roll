import { Test, TestingModule } from '@nestjs/testing';
import { FormuleService } from './formule.service';

describe('FormuleService', () => {
  let service: FormuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormuleService],
    }).compile();

    service = module.get<FormuleService>(FormuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

});
