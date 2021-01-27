import { ISheet } from "../interface/sheet.interface";
import { IVisitor } from "../visitor/visitor.interface";
import { ISkillsCrashpandas } from "./skills.crashpandas";

export class CrashpandasSheet implements ISheet {
    constructor(public skills: ISkillsCrashpandas) {};
    
    getSkills(): ISkillsCrashpandas {
        return this.skills;
    };
    
    convert(v: IVisitor): string {
        return v.visitCrashpandas(this);
    };
}