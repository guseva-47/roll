import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { IJwtPayload } from '../interface/jwt-payload.interfase';

// const jwtConstant = process.env.JWT_CONSTANT;

const jwtConstant="secretsecret"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstant,
    });
  }

  async validate(payload: IJwtPayload): Promise<IJwtPayload> {
    console.log(payload);
    return {userId: payload.userId, email: payload.email};
  }
}