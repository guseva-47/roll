import { BadRequestException, Controller, Get, Logger, LoggerService, Param } from '@nestjs/common';

import { SheetService } from './sheet.service';
import { gameSystem as gameSystemEnum } from "./enum/game-system.enum";

@Controller('sheet')
export class SheetController {
    private readonly logger: LoggerService = new Logger(SheetController.name);
    
    constructor(
        private sheetService: SheetService,
    ) {}

    @Get()
    sheet(): string {
        return 'Hello, sheet!.';
    }

    @Get('newNPCSheet/:gameSystem')
    getNewNPCSheet(@Param('gameSystem') gameSystem: gameSystemEnum): INPCSheet {
        const f = Object.values(gameSystemEnum).includes(gameSystem as gameSystemEnum);
        if ( !f ){
            this.logger.log(`getNewNPCSheet(). gameSystem = ${gameSystem} isEnum? == ${f}`);
            throw new BadRequestException;
        }
        return this.sheetService.createNPCSheet(gameSystem as gameSystemEnum);
    }

    @Get('newPlayerSheet/:gameSystem')
    getNewPlayerSheet(@Param('gameSystem') gameSystem: string): IPlayerSheet {
        
        if ( !Object.values(gameSystemEnum).includes(gameSystem as gameSystemEnum) )
            throw new BadRequestException;

        return this.sheetService.createPlayerSheet(gameSystem as gameSystemEnum);
    }

}
