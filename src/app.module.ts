import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user/user.module';
import { AppController } from './app.controller';
import { TabletopModule } from './tabletop/tabletop.module';
import { configModule } from './configure.root';

const environment = process.env.NODE_ENV || 'development';
const MONGODB_WRITE_CONNECTION_STRING = 'mongodb://localhost:27017/nest-write'

@Module({
    imports: [
        configModule,
        MongooseModule.forRoot(
            MONGODB_WRITE_CONNECTION_STRING,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        ),
        TabletopModule,
        AuthModule,
        UsersModule,
    ],
    controllers: [AppController]
})

export class AppModule { }