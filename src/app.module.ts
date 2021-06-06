import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { UsersModule as UserModule } from './user/user.module';
import { AppController } from './app.controller';
import { TabletopModule } from './tabletop/tabletop.module';
import { configModule } from './configure.root';
import { UserFriendsController } from './user/user-friends.controller';
import { UserTabletopsController } from './user/user-tabletops.controller';
import { TrueRandomeModule } from './true-randome/true-randome.module';
import { winstoneConfig } from './winston.configure.root';
import { FormulaModule } from './formula/formula.module';
import { FormulaController } from './formula/formula.controller';
import { SheetModule } from './sheet/sheet.module';
import { SheetController } from './sheet/sheet.controller';
import { NoteModule } from './note/note.module';
import { UserNotesController } from './user/user-notes.controller';
import { MessageModule } from './message/message.module';

const MONGODB_WRITE_CONNECTION_STRING = 'mongodb://localhost:27017/roll_db'; // todo вынести в .env
// const MONGODB_WRITE_CONNECTION_STRING = 'mongodb://login:password@localhost:27017/roll_db'

@Module({
    imports: [
        configModule,
        winstoneConfig,
        MongooseModule.forRoot(MONGODB_WRITE_CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        }),
        TabletopModule,
        AuthModule,
        UserModule,
        TrueRandomeModule,
        FormulaModule,
        SheetModule,
        NoteModule,
        MessageModule
    ],
    controllers: [
        AppController,
        UserFriendsController,
        UserTabletopsController,
        UserNotesController,
        FormulaController,
        SheetController,
    ],
    providers: [Logger],
})
export class AppModule {}
