import { Logger, LoggerService } from "@nestjs/common";

import { NPCHoneyheistSheet } from "./npc.honeyheist.sheet";
import { PlayerHoneyheistSheet } from "./player.honeyheist.sheet";

export class SheetFactoryHoneyheist implements ISheetFactory {
    private static instance = null;
    private readonly logger: LoggerService = new Logger(SheetFactoryHoneyheist.name);

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}
    
    static getInstance() : ISheetFactory {
        if (!SheetFactoryHoneyheist.instance) {
            SheetFactoryHoneyheist.instance = new SheetFactoryHoneyheist();
        }
        return SheetFactoryHoneyheist.instance;
    }
    
    createNPCSheet(): INPCSheet {
        this.logger.log(`createNPCSheet(): INPCSheet возвращение нового листа.`);
        return new NPCHoneyheistSheet('', '', '');
    }
    createPlayerSheet(): IPlayerSheet {
        this.logger.log(`createNPCSheet(): IPlayerSheet возвращение нового листа.`);
        return new PlayerHoneyheistSheet('', '', '');
    }
}