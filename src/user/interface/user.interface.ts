import { Document } from 'mongoose';

export interface IUser extends Document {
    readonly email: string;
    readonly nicname: string;
    readonly familyName: string;
    readonly givenName: string;
    readonly gender: string;
    readonly roles: Array<string>;
    readonly oauth2Source: string;
    readonly avatar: string;
    readonly selfInfo: string;
    readonly profilePrivatType: string;
    readonly lastActiveAt: Date;
    readonly subscribers: Array<string>;
    readonly subscriptions: Array<string>;
    readonly subscrReqsToMe: Array<string>;
    readonly subscrReqsFromMe: Array<string>;
    readonly ignoreUsers: Array<string>;
}
