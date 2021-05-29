import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TabletopModule } from 'src/tabletop/tabletop.module';

import { UserSchema } from './schema/user.schema';
import { UserFriendsService } from './user-friends.service';
import { UserTabletopsService } from './user-tabletops.service';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        TabletopModule,
    ],
    providers: [UserService, UserFriendsService, UserTabletopsService],
    exports: [UserService, UserFriendsService, UserTabletopsService],
    controllers: [UserController],
})
export class UsersModule {}
