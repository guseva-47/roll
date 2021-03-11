import { BadRequestException, Injectable, Logger, LoggerService } from '@nestjs/common';

import { gameSystem as gameSystemEnum } from "./enum/game-system.enum";
import { SheetFactoryHoneyheist } from "./honeyheist/sheet-factory.honeyheist";
import { SheetFactoryCrashPandas } from "./crashpandas/sheet-factory.crashpandas";

@Injectable()
export class SheetService {
    private readonly logger: LoggerService = new Logger(SheetService.name);

    private sheetFactory = null;

    private _getSheetFactory(gameSystem: gameSystemEnum): ISheetFactory {
        this.logger.log(`_getSheetFactory(): Создание фабрики нужного типа игры -${gameSystem}.`)
        if (gameSystem == gameSystemEnum.crashpandas)
            return SheetFactoryCrashPandas.getInstance();

        else if (gameSystem == gameSystemEnum.honeyheist)
            return SheetFactoryHoneyheist.getInstance();
        
        return null;
    }

    createNPCSheet(gameSystemType: gameSystemEnum): INPCSheet {
        this.logger.log(`createNPCSheet(): INPCSheet создание листа неигрока для игры с типом ${gameSystemType}.`);
        const gameSystem: ISheetFactory = this._getSheetFactory(gameSystemType);
        if (!gameSystem) throw new BadRequestException;
        
        return gameSystem.createNPCSheet();
    }
    createPlayerSheet(gameSystemType: gameSystemEnum): IPlayerSheet {
        this.logger.log(`createNPCSheet(): IPlayerSheet создание листа игрока для игры с типом ${gameSystemType}.`)
        const gameSystem: ISheetFactory = this._getSheetFactory(gameSystemType);
        if (!gameSystem) throw new BadRequestException;
        
        return gameSystem.createPlayerSheet();
    }

    createSheets(gameSystemType: gameSystemEnum, countNPCSheet: number, countPlayerSheet: number): Array<any> {
        this.logger.log(`createNPCSheet(). Создать ${countNPCSheet} листов для неигровых персонажей и ${countPlayerSheet} листов игровых персонажей`);
        const gameSystem: ISheetFactory = this._getSheetFactory(gameSystemType);
        if (!gameSystem) throw new BadRequestException;
        const sheets = [];
        for(let i = 0; i < countNPCSheet; i++)
            sheets.push(gameSystem.createNPCSheet());
        for(let j = 0; j < countPlayerSheet; j++)
            sheets.push(gameSystem.createPlayerSheet());
        return sheets;
    }
}
