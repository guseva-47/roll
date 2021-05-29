import { IsEmail, IsNotEmpty } from 'class-validator';
import { genderEnum } from '../enum/gender.enum';

import { oauth2Source } from '../enum/oauth2-source.enum';

export class CreateUserDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    oauth2Source: oauth2Source;

    familyName: string;
    givenName: string;

    gender: string = genderEnum.unspecified;
    lastActiveAt: Date = new Date();
}
