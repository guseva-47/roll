import { HoneyheistSheet } from "./honeyheist.sheet";

export class NPCHoneyheistSheet extends HoneyheistSheet implements INPCSheet {
    public monsterType: string;

    constructor(monsterType: string, bearScill: string, crimeSkill: string) {
        super(bearScill, crimeSkill);
        this.monsterType = monsterType;
    }
}