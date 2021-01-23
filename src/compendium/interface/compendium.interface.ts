import { gameSystem } from "src/sheet/enum/game-system.enum";

export interface ICompendium {
    notes: Array<INote>;
    gameSystems: Array<gameSystem>;
}