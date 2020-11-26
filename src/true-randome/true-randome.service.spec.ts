import { Test, TestingModule } from '@nestjs/testing';
import { TrueRandomeService } from './true-randome.service';

describe('TrueRandomeService', () => {
  let service: TrueRandomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrueRandomeService],
    }).compile();

    service = module.get<TrueRandomeService>(TrueRandomeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
