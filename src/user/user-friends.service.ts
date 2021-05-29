import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { profilePrivatType } from './enum/profile-privet-type.enum';
import { BadId } from './exseption/bad-id.exception';
import { UserNotFound } from './exseption/user-undefind.exception';
import { IUser } from './interface/user.interface';

@Injectable()
export class UserFriendsService {
    constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

    // все подписчики пользователя
    async getSubscribers(idMe: string, idSomeUser?: string): Promise<Array<IUser>> {
        if (!idSomeUser || idMe === idSomeUser) {
            const userMe = await this._usersCheck(idMe);
            return this._getUsersById(userMe.subscribers);
        }

        const userOther = await this._usersCheck(idSomeUser);

        if (
            userOther.profilePrivatType === profilePrivatType.closed &&
            !userOther.subscribers.find(curr => curr == idMe)
        )
            throw new ForbiddenException();

        return this._getUsersById(userOther.subscribers);
    }

    // все подписки пользователя
    async getSubscriptions(idMe: string, idSomeUser?: string): Promise<Array<IUser>> {
        if (!idSomeUser || idMe === idSomeUser) {
            const userMe = await this._usersCheck(idMe);
            return this._getUsersById(userMe.subscriptions);
        }

        const userOther = await this._usersCheck(idSomeUser);

        if (
            userOther.profilePrivatType === profilePrivatType.closed &&
            !userOther.subscribers.includes(idMe)
        )
            throw new ForbiddenException();

        return this._getUsersById(userOther.subscriptions);
    }

    // подписаться на другого пользователя
    async subscribe(idMe: string, idSomeUser: string): Promise<IUser> {
        let userMe: IUser = await this._usersCheck(idMe);
        let userOther: IUser = await this._usersCheck(idSomeUser);

        if (userOther.profilePrivatType === profilePrivatType.open)
            [userMe, userOther] = this._sub(userMe, userOther);
        else [userMe, userOther] = this._sendSubRequest(userMe, userOther);

        await userOther.save();
        return await userMe.save();
    }

    // отписаться от другого пользователя
    async unSubscribe(idMe: string, idSomeUser: string): Promise<IUser> {
        let userMe: IUser = await this._usersCheck(idMe);
        let userOther: IUser = await this._usersCheck(idSomeUser);

        [userMe, userOther] = this._unSub(userMe, userOther);

        await userOther.save();
        return await userMe.save();
    }

    // одобрить заявку на подписку (если у вас закрытый профиль)
    async approveSubscriber(idMe: string, idSomeUser: string): Promise<IUser> {
        let userMe: IUser = await this._usersCheck(idMe);
        if (userMe.profilePrivatType !== profilePrivatType.closed)
            throw new BadRequestException();

        let userOther: IUser = await this._usersCheck(idSomeUser);

        [userOther, userMe] = this._unSendSubRequest(userOther, userMe);

        [userOther, userMe] = this._sub(userOther, userMe);

        await userOther.save();
        return await userMe.save();
    }

    // неодобрить заявку на подписку (если у вас закрытый профиль)
    async unApproveSubscriber(idMe: string, idSomeUser: string): Promise<IUser> {
        let userMe: IUser = await this._usersCheck(idMe);
        if (userMe.profilePrivatType !== profilePrivatType.closed)
            throw new BadRequestException();

        let userOther: IUser = await this._usersCheck(idSomeUser);

        [userOther, userMe] = this._unSendSubRequest(userOther, userMe);

        await userOther.save();
        return await userMe.save();
    }

    // прервать подписку от другого пользователя на меня (если у вас закрытый профиль)
    async deleteSubscriber(idMe: string, idSomeUser: string): Promise<IUser> {
        let userMe: IUser = await this._usersCheck(idMe);
        if (userMe.profilePrivatType !== profilePrivatType.closed)
            throw new BadRequestException();

        let userOther: IUser = await this._usersCheck(idSomeUser);

        [userOther, userMe] = this._unSub(userOther, userMe);

        await userOther.save();
        return await userMe.save();
    }

    async isSubscriber(idSubscriber: string, idSomeUser: string): Promise<boolean> {
        let user = await this.userModel.findById(idSomeUser).orFail(new UserNotFound());
        user = await user.execPopulate();
        return user.subscribers.includes(idSubscriber);
    }

    private _sub(userFrom: IUser, userTo: IUser): [IUser, IUser] {
        if (userFrom.id === userTo.id) throw new BadRequestException();

        if (
            userFrom.subscriptions.includes(userTo.id) &&
            userTo.subscribers.includes(userFrom.id)
        )
            return [userFrom, userTo];

        if (
            userFrom.subscriptions.includes(userTo.id) ||
            userTo.subscribers.includes(userFrom.id)
        )
            throw new BadRequestException();

        userFrom.subscriptions.push(userTo.id);
        userTo.subscribers.push(userFrom.id);

        return [userFrom, userTo];
    }

    private _unSub(subscriber: IUser, userTo: IUser): [IUser, IUser] {
        if (subscriber.id === userTo.id) throw new BadRequestException();

        let indx = subscriber.subscriptions.findIndex(current => current == userTo.id);
        if (indx === -1) throw new BadRequestException();
        subscriber.subscriptions.splice(indx, 1);

        indx = userTo.subscribers.findIndex(current => current == subscriber.id);
        if (indx === -1) throw new BadRequestException();
        userTo.subscribers.splice(indx, 1);

        return [subscriber, userTo];
    }

    private _sendSubRequest(userFrom: IUser, userTo: IUser): [IUser, IUser] {
        if (userFrom === userTo) throw new BadRequestException();

        if (
            userFrom.subscrReqsFromMe.includes(userTo.id) &&
            userTo.subscrReqsToMe.includes(userFrom.id)
        )
            return [userFrom, userTo];

        if (
            userFrom.subscriptions.includes(userTo.id) &&
            userTo.subscribers.includes(userFrom.id)
        )
            return [userFrom, userTo];

        if (
            userFrom.subscrReqsFromMe.includes(userTo.id) ||
            userTo.subscrReqsToMe.includes(userFrom.id)
        ) {
            if (!userFrom.subscrReqsFromMe.includes(userTo.id))
                userFrom.subscrReqsFromMe.push(userTo.id);
            if (!userTo.subscrReqsToMe.includes(userFrom.id))
                userTo.subscrReqsToMe.push(userFrom.id);

            return [userFrom, userTo];
        }

        userFrom.subscrReqsFromMe.push(userTo.id);
        userTo.subscrReqsToMe.push(userFrom.id);

        return [userFrom, userTo];
    }

    private _unSendSubRequest(reqFrom: IUser, reqTo: IUser): [IUser, IUser] {
        if (reqFrom.id === reqTo.id) throw new BadRequestException();

        const indxOfFrom = reqFrom.subscrReqsFromMe.findIndex(
            current => current == reqTo.id,
        );
        if (indxOfFrom === -1) throw new BadRequestException();

        const indxOfTo = reqTo.subscrReqsToMe.findIndex(current => current == reqFrom.id);
        if (indxOfTo === -1) throw new BadRequestException();

        reqTo.subscrReqsToMe.splice(indxOfTo, 1);
        reqFrom.subscrReqsFromMe.splice(indxOfFrom, 1);

        return [reqFrom, reqTo];
    }

    private async _getUsersById(usersId: Array<string>): Promise<Array<IUser>> {
        const result = [];
        await Promise.all(
            usersId.map(async id => {
                const model: IUser = await this.userModel.findById(id);
                if (model) result.push(model);
            }),
        );

        return result;
    }

    private async _usersCheck(idUser: string): Promise<IUser> {
        if (!Types.ObjectId.isValid(idUser)) throw new BadId();

        const user = await this.userModel.findById(idUser).orFail(new UserNotFound());
        return await user.execPopulate();
    }
}
