import { IsEmail, IsNotEmpty } from 'class-validator';
import { genderEnum } from '../enum/gender.enum';

import { oauth2Source } from '../enum/oauth2-source.enum';
import { profilePrivatType } from '../enum/profile-privet-type.enum';
import { roleEnum } from '../enum/role.enum';

export class UserDto {
    @IsNotEmpty()
    _id: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    oauth2Source: oauth2Source;

    familyName: string;
    givenName: string;
    gender: genderEnum = genderEnum.unspecified;
    nicname: string;
    roles: Array<roleEnum>;
    avatar: string;
    selfInfo: string;
    profilePrivatType: profilePrivatType;
    lastActiveAt: Date;

    subscribers: Array<string>;
    subscriptions: Array<string>;
    subscrReqsToMe: Array<string>;
    subscrReqsFromMe: Array<string>;

    ignoreUsers: Array<string>;
}
