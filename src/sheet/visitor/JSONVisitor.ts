import { Logger, LoggerService } from "@nestjs/common";
import { CrashpandasSheet } from "../crashpandas/crashpandas.sheet";
import { NPCCrashpandasSheet } from "../crashpandas/npc.crashpandas.sheet";
import { PlayerCrashpandasSheet } from "../crashpandas/player.crashpandas.sheet";
import { HoneyheistSheet } from "../honeyheist/honeyheist.sheet";
import { NPCHoneyheistSheet } from "../honeyheist/npc.honeyheist.sheet";
import { PlayerHoneyheistSheet } from "../honeyheist/player.honeyheist.sheet";
import { IVisitor } from "./visitor.interface";

export class JSONVisitor implements IVisitor {
    private readonly logger: LoggerService = new Logger(JSONVisitor.name);
    visitNPCCrashpandas(c: NPCCrashpandasSheet): string {
        this.logger.log('visitNPCCrashpandas(). Конвертация в JSON.')
        return JSON.stringify(c.getInfo());
    }
    visitPlayerCrashpandas(c: PlayerCrashpandasSheet): string {
        this.logger.log('visitPlayerCrashpandas(). Конвертация в JSON.')
        return JSON.stringify(c.getInfo());
    }
    visitNPCHoneyHeist(c: NPCHoneyheistSheet): string {
        this.logger.log('visitNPCHoneyHeist(). Конвертация в JSON.')
        return JSON.stringify(c.getInfo());
    }
    visitPlayerHoneyheist(c: PlayerHoneyheistSheet): string {
        this.logger.log('visitPlayerHoneyheist(). Конвертация в JSON.')
        return JSON.stringify(c.getInfo());
    }
    visitHoneyHeist(c: HoneyheistSheet): string {
        this.logger.log('visitHoneyHeist(). Конвертация в JSON.')
        return JSON.stringify(c.getSkills());
    }
    visitCrashpandas(c: CrashpandasSheet): string {
        this.logger.log('visitCrashpandas(). Конвертация в JSON.')
        return JSON.stringify(c.getSkills());
    }
}