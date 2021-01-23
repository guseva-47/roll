import { IVisitor } from "../visitor/visitor.interface";
import { CrashpandasSheet } from "./crashpandas.sheet";

export class NPCCrashpandasSheet extends CrashpandasSheet implements INPCSheet {
    public monsterType: string;

    constructor(monsterType: string, skills: ISkillsCrashpandas) {
        super(skills);
        this.monsterType = monsterType;
    };

    getInfo(): Record<string, unknown>  {
        const info = {
            skills: super.getSkills(),
            monsterType: this.monsterType,
        }
        return info;
    };

    convert(v: IVisitor): string {
        return v.visitNPCCrashpandas(this);
    };
}