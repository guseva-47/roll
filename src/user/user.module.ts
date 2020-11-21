import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TabletopModule } from 'src/tabletop/tabletop.module';
import { TabletopService } from 'src/tabletop/tabletop.service';

import { UserSchema } from './schema/user.schema';
import { UserFriendsService } from './user-friends.service';
import { UsersTabletopsService } from './user-tabletops.service';
import { UserService } from './user.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        TabletopModule,
    ],
    providers: [UserService, UserFriendsService, UsersTabletopsService],
    exports: [UserService, UserFriendsService, UsersTabletopsService],
})
export class UsersModule { }
