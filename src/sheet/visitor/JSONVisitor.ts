import { CrashpandasSheet } from "../crashpandas/crashpandas.sheet";
import { NPCCrashpandasSheet } from "../crashpandas/npc.crashpandas.sheet";
import { PlayerCrashpandasSheet } from "../crashpandas/player.crashpandas.sheet";
import { HoneyheistSheet } from "../honeyheist/honeyheist.sheet";
import { NPCHoneyheistSheet } from "../honeyheist/npc.honeyheist.sheet";
import { PlayerHoneyheistSheet } from "../honeyheist/player.honeyheist.sheet";
import { IVisitor } from "./visitor.interface";

class JSONVisitor implements IVisitor {
    visitNPCCrashpandas(c: NPCCrashpandasSheet): string {
        return JSON.stringify(c.getInfo());
    }
    visitPlayerCrashpandas(c: PlayerCrashpandasSheet): string {
        return JSON.stringify(c.getInfo());
    }
    visitNPCHoneyHeist(c: NPCHoneyheistSheet): string {
        return JSON.stringify(c.getInfo());
    }
    visitPlayerHoneyheist(c: PlayerHoneyheistSheet): string {
        return JSON.stringify(c.getInfo());
    }
    visitHoneyHeist(c: HoneyheistSheet): string {
        return JSON.stringify(c.getSkills());
    }
    visitCrashpandas(c: CrashpandasSheet): string {
        return JSON.stringify(c.getSkills());
    }
}