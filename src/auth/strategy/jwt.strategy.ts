import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { IJwtPayload } from '../interface/jwt-payload.interfase';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_CONSTANT,
        });
    }

    async validate(payload: IJwtPayload): Promise<IJwtPayload> {
        console.log(payload);
        return { userId: payload.userId, email: payload.email };
    }
}