import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserSchema } from './schema/user.schema';
import { UserFriendsService } from './user-friends.service';
import { UserService } from './user.service';

@Module({
  imports: [MongooseModule.forFeature([{name: 'User', schema: UserSchema}])],
  providers: [UserService, UserFriendsService],
  exports: [UserService, UserFriendsService],
})
export class UsersModule {}
