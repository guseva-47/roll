import { Logger, LoggerService } from "@nestjs/common";

import { NPCCrashpandasSheet } from "./npc.crashpandas.sheet";
import { PlayerCrashpandasSheet } from "./player.crashpandas.sheet";

export class SheetFactoryCrashPandas implements ISheetFactory {
    private readonly logger: LoggerService = new Logger(SheetFactoryCrashPandas.name);
    
    createNPCSheet(): INPCSheet {
        this.logger.log(`createNPCSheet(): INPCSheet возвращение нового листа.`);
        return new NPCCrashpandasSheet('', {} as ISkillsCrashpandas);
    }
    createPlayerSheet(): IPlayerSheet {
        this.logger.log(`createNPCSheet(): IPlayerSheet возвращение нового листа.`);
        return new PlayerCrashpandasSheet('', {} as ISkillsCrashpandas);
    }
}