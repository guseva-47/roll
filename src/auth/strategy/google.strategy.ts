import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, StrategyOptionsWithRequest, VerifyCallback, Profile } from 'passport-google-oauth20';

import { CreateUserDto } from "src/user/dto/create-user.dto";
import { genderEnum } from "src/user/enum/gender.enum";
import { oauth2Source } from "src/user/enum/oauth2-source.enum";


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google')
{
    constructor() {
        super({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.CALLBACK_URL,
            scope: ['email', 'profile'],
        } as StrategyOptionsWithRequest)
    }

    async validate(_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback): Promise<any> {

        const user = new CreateUserDto()
        user.email = profile.emails[0].value;
        user.familyName = profile.name.familyName
        user.givenName = profile.name.givenName;
        user.oauth2Source = oauth2Source.google;

        done(null, user);
    }
}