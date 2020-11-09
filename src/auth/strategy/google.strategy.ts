import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, StrategyOptionsWithRequest, VerifyCallback, Profile } from 'passport-google-oauth20';

import { CreateUserDto } from "src/user/dto/create-user.dto";
import { genderEnum } from "src/user/enum/gender.enum";
import { oauth2Source } from "src/user/enum/oauth2-source.enum";

// const clientID = process.env.CLIENT_ID;
// const clientSecret = process.env.CLIENT_SECRET;
// const callbackURL = process.env.CALLBACK_URL;

const clientID="604004529540-5mrog2ibckce89sg3odlon8acs9mmaf3.apps.googleusercontent.com"
const clientSecret="U3MSUXIw75632xQ1KEQCdgy3"
const callbackURL="http://localhost:3000/auth/google/redirect"

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google')
{
    constructor()
    {
        super({
            clientID    : clientID,
            clientSecret: clientSecret,
            callbackURL : callbackURL,
            scope: ['email', 'profile'],
        } as StrategyOptionsWithRequest)
    }

    async validate (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback): Promise<any> {

        const user = new CreateUserDto()
        user.email = profile.emails[0].value;
        user.familyName = profile.name.familyName
        user.givenName = profile.name.givenName;
        user.oauth2Source = oauth2Source.google;

        done(null, user);
    }
}