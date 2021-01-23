import { IVisitor } from "../visitor/visitor.interface";
import { HoneyheistSheet } from "./honeyheist.sheet";

export class NPCHoneyheistSheet extends HoneyheistSheet implements INPCSheet {
    public monsterType: string;

    constructor(monsterType: string, bearScill: string, crimeSkill: string) {
        super(bearScill, crimeSkill);
        this.monsterType = monsterType;
    }

    getInfo(): Record<string, unknown> {
        const info = {
            stats: super.getSkills(),
            monsterType: this.monsterType
        };
        return info;
    }

    convert(v: IVisitor): string {
        return v.visitNPCHoneyHeist(this);
    };
}