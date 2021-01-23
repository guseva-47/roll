import { ISheet } from "../interface/sheet.interface";
import { IVisitor } from "../visitor/visitor.interface";

export class HoneyheistSheet implements ISheet{
    constructor(public bearSkill: string, public criminalSkill: string) {};
    
    convert(v: IVisitor): string {
        return v.visitHoneyHeist(this);
    };
    
    getSkills(): Record<string, unknown> {
        return {
            bearSkill: this.bearSkill,
            criminalSkill: this.criminalSkill,
        }
    };
}