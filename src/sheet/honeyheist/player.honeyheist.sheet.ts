import { IVisitor } from "../visitor/visitor.interface";
import { HoneyheistSheet } from "./honeyheist.sheet";

export class PlayerHoneyheistSheet extends HoneyheistSheet implements IPlayerSheet{
    playerId: string;

    constructor(playerId: string, bearScill: string, crimeSkill: string) {
        super(bearScill, crimeSkill);
        this.playerId = playerId;
    }

    convert(v: IVisitor): string {
        return v.visitPlayerHoneyheist(this);
    };

    getInfo(): Record<string, unknown> {
        return {
            skills: super.getSkills(),
        }
    }
    
}