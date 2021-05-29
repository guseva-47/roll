import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategy/local.strategy';
import { UsersModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { JwtStrategy } from './strategy/jwt.strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { AuthController } from './auth.controller';
import { configModule } from 'src/configure.root';
import { RefreshTokenSchema } from './schema/refresh-token.schema';

@Module({
    imports: [
        UsersModule,
        PassportModule,
        configModule,
        JwtModule.register({
            secret: process.env.JWT_CONSTANT,
            signOptions: { expiresIn: process.env.JWT_ACCESS_TOKEN_PERIOD },
        }),
        MongooseModule.forFeature([
            { name: 'RefreshTokenSchema', schema: RefreshTokenSchema },
        ]),
    ],
    providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy],
    exports: [AuthService],
    controllers: [AuthController],
})
export class AuthModule {}
