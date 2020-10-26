import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, StrategyOptionsWithRequest, VerifyCallback, Profile } from 'passport-google-oauth20';

import { CreateUserDto } from "src/user/dto/create-user.dto";


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google')
{
    constructor()
    {
        super({
            clientID    : '604004529540-5mrog2ibckce89sg3odlon8acs9mmaf3.apps.googleusercontent.com',
            clientSecret: 'U3MSUXIw75632xQ1KEQCdgy3',
            callbackURL : 'http://localhost:3000/auth/google/redirect',
            scope: ['email', 'profile'],
        } as StrategyOptionsWithRequest)
    }

    async validate (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback): Promise<any> {

        const user = new CreateUserDto(
            profile.emails[0].value,
            profile.emails[0].type === 'true',
            profile.name.familyName,
            profile.name.givenName,
        )

        done(null, user);
    }
}