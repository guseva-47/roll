import { Module } from '@nestjs/common';
import { SheetService } from './sheet.service';
import { SheetController } from './sheet.controller';

@Module({
    providers: [SheetService],
    controllers: [SheetController],
    exports: [SheetService],
})
export class SheetModule {}
