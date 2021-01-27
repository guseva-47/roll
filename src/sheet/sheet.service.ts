import { BadRequestException, Injectable, Logger, LoggerService } from '@nestjs/common';

import { gameSystem as gameSystemEnum } from "./enum/game-system.enum";
import { SheetFactoryHoneyheist } from "./honeyheist/sheet-factory.honeyheist";
import { SheetFactoryCrashPandas } from "./crashpandas/sheet-factory.crashpandas";
import { NPCHoneyheistSheet } from './honeyheist/npc.honeyheist.sheet';
import { BearSkill } from './honeyheist/bear-skill.enum';
import { CriminalSkill } from './honeyheist/criminal-skill.enum ';
import { PlayerHoneyheistSheet } from './honeyheist/player.honeyheist.sheet';
import { NPCCrashpandasSheet } from './crashpandas/npc.crashpandas.sheet';
import { ISkillsCrashpandas } from './crashpandas/skills.crashpandas';
import { PlayerCrashpandasSheet } from './crashpandas/player.crashpandas.sheet';
import { JSONVisitor } from './visitor/JSONVisitor';
import { HTMLVisitor } from './visitor/HTMLVisitor';

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

    testVisitor() {
        this.logger.log(`testVisitor(). Создание лситов персонажей.`)
        // создать лист honeyheist. заполнить его. вывести в печать. создать лист crahpandas повторить
        const honeyNPC = new NPCHoneyheistSheet('The angry bees', BearSkill.swim, CriminalSkill.muscle);
        const honeyPlayer = new PlayerHoneyheistSheet('', BearSkill.eat, CriminalSkill.brains)

        const leoSkills: ISkillsCrashpandas = {
            alacrity: 16,
            chutzpah: 9,
            ferouciousness: 12,
            rotundity: 10,
        }
        const pandaSkills: ISkillsCrashpandas = {
            alacrity: 8,
            chutzpah: 18,
            ferouciousness: 6,
            rotundity: 10,
        }
        const pandaNPC = new NPCCrashpandasSheet('The sly leopard', leoSkills);
        const pandaPlayer = new PlayerCrashpandasSheet('', pandaSkills);

        this.logger.log(`testVisitor(). Создание объекта JSONVisitor.`)
        this.logger.log(`testVisitor(). Конвертирование листов в JSON.`)
        let str = ''
        const converterJSON = new JSONVisitor();
        str += pandaNPC.convert(converterJSON) + '\n\n';
        str += honeyNPC.convert(converterJSON) + '\n\n';
        str += pandaPlayer.convert(converterJSON) + '\n\n';
        str += honeyPlayer.convert(converterJSON) + '\n\n';
        
        this.logger.log(`testVisitor(). Создание объекта HTMLVisitor.`)
        this.logger.log(`testVisitor(). Конвертирование листов в HTML.`)
        const converterHTML = new HTMLVisitor();
        str += pandaNPC.convert(converterHTML) + '\n\n';
        str += honeyNPC.convert(converterHTML) + '\n\n';
        str += pandaPlayer.convert(converterHTML) + '\n\n';
        str += honeyPlayer.convert(converterHTML) + '\n\n';

        return str;
    }


}
