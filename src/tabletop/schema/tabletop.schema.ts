import * as mongoose from 'mongoose';
import { gameSystem } from 'src/sheet/enum/game-system.enum';

import { gameRole } from '../enum/game-role.enum';

export const TabletopSchema = new mongoose.Schema({ 
    name: { type: String, required: true },
    gameSessionLink: { type: String, required: false },
    owner: { type: mongoose.Schema.Types.ObjectId, required: true },
    //admins: { type: [mongoose.Schema.Types.ObjectId], required: false },

    players: [{ 
        user: {type: mongoose.Schema.Types.ObjectId, required: true},
        role: {type: String, required: true, enum: Object.values(gameRole)},
    }] ,

    avatar: { type: String, required: false },
    aboutInfo: { type: String, required: false },
    gameSystem: { type: String, required: false, enum: Object.values(gameSystem) },
 });