import * as mongoose from 'mongoose';
import { genderEnum } from '../enum/gender.enum';
import { oauth2Source } from '../enum/oauth2-source.enum';
import { profilePrivatType } from '../enum/profile-privet-type.enum';
import { roleEnum } from '../enum/role.enum';

export const UserSchema = new mongoose.Schema({
    email: { type: String, required: true },
    nicname: { type: String, required: false },
    familyName: { type: String, required: true },
    givenName: { type: String, required: true },
    gender: {
        type: String,
        required: true,
        enum: Object.values(genderEnum),
        default: genderEnum.unspecified,
    },
    roles: {
        type: [String],
        required: true,
        enum: Object.values(roleEnum),
        default: [roleEnum.user],
    },
    oauth2Source: { type: String, required: true, enum: Object.values(oauth2Source) },
    avatar: { type: String, required: false },
    selfInfo: { type: String, required: false },
    profilePrivatType: {
        type: String,
        reguired: false,
        enum: Object.values(profilePrivatType),
        default: profilePrivatType.open,
    },
    lastActiveAt: { type: Date, required: false },

    subscribers: { type: [mongoose.Schema.Types.ObjectId], required: false },
    subscriptions: { type: [mongoose.Schema.Types.ObjectId], required: false },
    subscrReqsToMe: { type: [mongoose.Schema.Types.ObjectId], required: false }, //кто просит у меня добавить их в подписчики
    subscrReqsFromMe: { type: [mongoose.Schema.Types.ObjectId], required: false }, //кому я отправил запрос на подписку

    ignoreUsers: { type: [mongoose.Schema.Types.ObjectId], required: false },
});

//  UserSchema.index({ email: 1 }, { unique: true });
