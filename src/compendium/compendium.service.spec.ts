import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumService } from './compendium.service';

describe('CompendiumService', () => {
  let service: CompendiumService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompendiumService],
    }).compile();

    service = module.get<CompendiumService>(CompendiumService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
