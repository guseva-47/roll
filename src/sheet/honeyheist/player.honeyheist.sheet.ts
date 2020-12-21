import { HoneyheistSheet } from "./honeyheist.sheet";

export class PlayerHoneyheistSheet extends HoneyheistSheet implements IPlayerSheet{
    playerId: string;

    constructor(playerId: string, bearScill: string, crimeSkill: string) {
        super(bearScill, crimeSkill);
        this.playerId = playerId;
    }
    
}