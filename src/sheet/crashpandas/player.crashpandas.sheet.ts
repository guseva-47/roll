import { IVisitor } from "../visitor/visitor.interface";
import { CrashpandasSheet } from "./crashpandas.sheet";
import { ISkillsCrashpandas } from "./skills.crashpandas";

export class PlayerCrashpandasSheet extends CrashpandasSheet implements IPlayerSheet{
    playerId: string;

    constructor(playerId: string, skills: ISkillsCrashpandas) {
        super(skills);
        this.playerId = playerId;
    };

    getInfo(): Record<string, unknown> {
        return {skills: this.skills};
    };

    convert(v: IVisitor): string {
        return v.visitPlayerCrashpandas(this);
    };
}