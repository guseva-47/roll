import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategy/local.strategy';
import { UsersModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { JwtStrategy } from './strategy/jwt.strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { AuthController } from './auth.controller';

// const jwtConstant = process.env.JWT_CONSTANT;
// const jwtTokenPeriod = process.env.JWT_TOKEN_PERIOD;

const jwtConstant="secretsecret"
const jwtTokenPeriod="60s"

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstant,
      signOptions: { expiresIn: jwtTokenPeriod },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}