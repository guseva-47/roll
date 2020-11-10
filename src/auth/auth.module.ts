import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategy/local.strategy';
import { UsersModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { JwtStrategy } from './strategy/jwt.strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { AuthController } from './auth.controller';


@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_CONSTANT,
            signOptions: { expiresIn: process.env.JWT_TOKEN_PERIOD },
        }),
    ],
    providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy],
    exports: [AuthService],
    controllers: [AuthController],
})
export class AuthModule { }