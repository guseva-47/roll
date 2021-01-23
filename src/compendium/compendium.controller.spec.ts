import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumController } from './compendium.controller';

describe('CompendiumController', () => {
  let controller: CompendiumController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompendiumController],
    }).compile();

    controller = module.get<CompendiumController>(CompendiumController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
