import { Injectable, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, StrategyOptionsWithRequest, VerifyCallback, Profile } from 'passport-google-oauth20';
import { AuthService } from "../auth.service";


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google')
{

    constructor(
        private readonly authService: AuthService
    )
    {
        super({
            clientID    : '604004529540-5mrog2ibckce89sg3odlon8acs9mmaf3.apps.googleusercontent.com',
            clientSecret: 'U3MSUXIw75632xQ1KEQCdgy3',
            callbackURL: 'http://localhost:3000/google/redirect',
            scope: ['email', 'profile'],
        } as StrategyOptionsWithRequest)
    }

    async validate (accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const { name, emails } = profile;
        const user = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
        };
        const payload = {
            user,
            accessToken,
        };

        done(null, payload);
    }
}