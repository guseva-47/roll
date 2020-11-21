import { IsNotEmpty } from "class-validator";

import { IPlayer } from "../interface/player.interfase";

export class TabletopDto {
    @IsNotEmpty()
    _id: string;
    
    @IsNotEmpty()
    name: string;
    
    gameSessionLink: string;
    
    @IsNotEmpty()
    owner: string;
    
    admins: Array<string>;

    players: Array<IPlayer>;

    avatar: string;
    aboutInfo: string;
    gameSystem: string;
}