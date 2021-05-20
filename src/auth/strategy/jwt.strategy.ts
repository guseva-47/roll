import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { IJwtAccessPayload } from '../interface/jwt-access-payload.interfase'


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_CONSTANT,
        });
    }

    async validate(payload: IJwtAccessPayload): Promise<IJwtAccessPayload> {

        return { id: payload.id, email: payload.email };
    }
}