import { Logger, LoggerService } from "@nestjs/common";

import { NPCCrashpandasSheet } from "./npc.crashpandas.sheet";
import { PlayerCrashpandasSheet } from "./player.crashpandas.sheet";
import { ISkillsCrashpandas } from "./skills.crashpandas";

export class SheetFactoryCrashPandas implements ISheetFactory {

    private static instance = null;
    private readonly logger: LoggerService = new Logger(SheetFactoryCrashPandas.name);

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {
        this.logger.log('SheetFactoryCrashPandas() Приватный конструктор фабрики.')
    }
    
    static getInstance() : ISheetFactory {
        if (!SheetFactoryCrashPandas.instance) {
            SheetFactoryCrashPandas.instance = new SheetFactoryCrashPandas();
        }
        return SheetFactoryCrashPandas.instance;
    }

    createNPCSheet(): INPCSheet {
        this.logger.log(`createNPCSheet(): INPCSheet возвращение нового листа.`);
        return new NPCCrashpandasSheet('', {} as ISkillsCrashpandas);
    }
    createPlayerSheet(): IPlayerSheet {
        this.logger.log(`createNPCSheet(): IPlayerSheet возвращение нового листа.`);
        return new PlayerCrashpandasSheet('', {} as ISkillsCrashpandas);
    }
}