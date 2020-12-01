import { gameRole } from "../enum/game-role.enum";

export interface IPlayer {
    readonly user: string;
    readonly role: gameRole;
}