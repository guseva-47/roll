import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston'

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user/user.module';
import { AppController } from './app.controller';
import { TabletopModule } from './tabletop/tabletop.module';
import { configModule } from './configure.root';
import { UserFriendsController } from './user/user-friends.controller';
import { UserTabletopsController } from './user/user-tabletops.controller';

const MONGODB_WRITE_CONNECTION_STRING = 'mongodb://localhost:27017/nest-write'

@Module({
    imports: [
        configModule,
        WinstonModule.forRoot({
            level: 'debug',
            handleExceptions: true,
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.colorize(),
                winston.format.printf(({ level, timestamp, context, message }) =>
                    `[${level}] ${timestamp} [${context}]: ${message}`
                )
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({
                    filename: 'logs/debug.log',
                    format: winston.format.uncolorize()
                })
            ],
        }),
        MongooseModule.forRoot(
            MONGODB_WRITE_CONNECTION_STRING,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
            }
        ),
        TabletopModule,
        AuthModule,
        UsersModule,
        TabletopModule,
    ],
    controllers: [AppController, UserFriendsController, UserTabletopsController],
    providers: [Logger]
})
export class AppModule { }