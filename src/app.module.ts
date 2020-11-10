import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user/user.module';
import { AppController } from './app.controller';
import { TabletopModule } from './tabletop/tabletop.module';

const environment = process.env.NODE_ENV || 'development';
const MONGODB_WRITE_CONNECTION_STRING = 'mongodb://localhost:27017/nest-write'

@Module({
    imports: [
        AuthModule,
        UsersModule,

        ConfigModule.forRoot({
            envFilePath: '.env.' + environment,
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

export class AppModule { }