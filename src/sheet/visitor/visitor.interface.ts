import { CrashpandasSheet } from "../crashpandas/crashpandas.sheet";
import { NPCCrashpandasSheet } from "../crashpandas/npc.crashpandas.sheet";
import { PlayerCrashpandasSheet } from "../crashpandas/player.crashpandas.sheet";
import { HoneyheistSheet } from "../honeyheist/honeyheist.sheet";
import { NPCHoneyheistSheet } from "../honeyheist/npc.honeyheist.sheet";
import { PlayerHoneyheistSheet } from "../honeyheist/player.honeyheist.sheet";

export interface IVisitor {
    visitCrashpandas(c: CrashpandasSheet): string;
    visitNPCCrashpandas(c: NPCCrashpandasSheet): string;
    visitPlayerCrashpandas(c: PlayerCrashpandasSheet): string;
    
    visitHoneyHeist(c: HoneyheistSheet): string;
    visitNPCHoneyHeist(c: NPCHoneyheistSheet): string;
    visitPlayerHoneyheist(c: PlayerHoneyheistSheet): string;
    
}