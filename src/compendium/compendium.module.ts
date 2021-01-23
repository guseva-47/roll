import { Module } from '@nestjs/common';
import { CompendiumController } from './compendium.controller';
import { CompendiumService } from './compendium.service';

@Module({
  controllers: [CompendiumController],
  providers: [CompendiumService]
})
export class CompendiumModule {}
