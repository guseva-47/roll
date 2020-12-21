import { CrashpandasSheet } from "./crashpandas.sheet";

export class NPCCrashpandasSheet extends CrashpandasSheet implements INPCSheet {
    public monsterType: string;

    constructor(monsterType: string, skils: ISkillsCrashpandas) {
        super(skils);
        this.monsterType = monsterType;
    }
}