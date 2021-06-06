import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TabletopModule } from 'src/tabletop/tabletop.module';

import { UserSchema } from './schema/user.schema';
import { UserFriendsService } from './user-friends.service';
import { UserTabletopsService } from './user-tabletops.service';
import { UserService } from './user.service';
import { UserController } from './user.controller';
// import { NoteService } from '../note/note.service';
import { UserTabletopsController } from './user-tabletops.controller';
import { UserNotesController } from './user-notes.controller';
import { UserFriendsController } from './user-friends.controller';
import { NoteModule } from 'src/note/note.module';
import { UserNotesService } from './user-notes.service';
import { UserMessagesController } from './user-messages.controller';
import { UserMessagesService } from './user-message.service';
import { ChatGateway } from './chat.gateway';
import { MessageModule } from 'src/message/message.module';
import { FormulaModule } from 'src/formula/formula.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        NoteModule,
        TabletopModule,
        MessageModule,
        FormulaModule
    ],
    providers: [
        UserService,
        UserFriendsService,
        UserTabletopsService,
        UserNotesService,
        UserMessagesService,
        ChatGateway,
    ],
    exports: [
        UserService,
        UserFriendsService,
        UserTabletopsService,
        UserNotesService,
        UserMessagesService,
    ],
    controllers: [
        UserController,
        UserTabletopsController,
        UserNotesController,
        UserFriendsController,
        UserMessagesController,
    ],
})
export class UsersModule {}
