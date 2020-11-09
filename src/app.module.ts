import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user/user.module';
import { AppController } from './app.controller';
import { TabletopModule } from './tabletop/tabletop.module';

const environment = process.env.NODE_ENV || 'development';
const MONGODB_WRITE_CONNECTION_STRING='mongodb://localhost:27017/nest-write'

console.log('проверка дотенв')
console.log(process.env.JWT_CONSTANT)

@Module({
  imports: [
    AuthModule,
    UsersModule,

    ConfigModule.forRoot({
      envFilePath: '.env.development',
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      MONGODB_WRITE_CONNECTION_STRING,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    ),
    TabletopModule,
  ],
  controllers: [AppController]
})
export class AppModule {}
