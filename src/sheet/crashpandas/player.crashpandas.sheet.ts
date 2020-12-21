import { CrashpandasSheet } from "./crashpandas.sheet";

export class PlayerCrashpandasSheet extends CrashpandasSheet implements IPlayerSheet{
    playerId: string;

    constructor(playerId: string, skills: ISkillsCrashpandas) {
        super(skills);
        this.playerId = playerId;
    }
    
}