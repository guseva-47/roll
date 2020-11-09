import { Document } from 'mongoose';

import { IPlayer } from './player.interfase';

export interface ITabletop extends Document {
    
    readonly name: string;
    readonly gameSessionLink: string;
    readonly owner: string;
    readonly admins: Array<string>;

    readonly players: Array<IPlayer>;

    readonly avatar: string;
    readonly aboutInfo: string;
    readonly gameSystem: string;
}