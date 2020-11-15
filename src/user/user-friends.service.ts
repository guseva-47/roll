import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { profilePrivatType } from './enum/profile-privet-type.enum';
import { BadId } from './exseption/bad-id.exception';
import { UserNotFound } from './exseption/user-undefind.exception';
import { IUser } from './interface/user.interface';

@Injectable()
export class UserFriendsService {
   constructor(@InjectModel('User') private readonly userModel: Model<IUser>){}

   // все подписчики пользователя
   async getSubscribers(idMe: string, idSomeUser?: string): Promise<Array<IUser>> {
        
        if (!idSomeUser || idMe === idSomeUser) {
            const userMe = await (await this.userModel.findById(idMe)).execPopulate();
            return this._getUsersById(userMe.subscribers);
        }

        const userOther = await (await this.userModel.findById(idSomeUser)).execPopulate();

        if (userOther.profilePrivatType === profilePrivatType.closed && !userOther.subscribers.includes(idMe)) 
            throw new BadRequestException;
        
        return this._getUsersById(userOther.subscribers);
   }

   // все подписки пользователя
   async getSubscriptions(idMe: string, idSomeUser?: string): Promise<Array<IUser>> {
        if (!idSomeUser || idMe === idSomeUser) {
            const userMe = await (await this.userModel.findById(idMe)).execPopulate();
            return this._getUsersById(userMe.subscriptions);
        }

        const userOther = await (await this.userModel.findById(idSomeUser)).execPopulate();

        if (userOther.profilePrivatType === profilePrivatType.closed && !userOther.subscribers.includes(idMe)) 
            throw new BadRequestException;
        
        return this._getUsersById(userOther.subscriptions);
   }
   
   // подписаться на другого пользователя
    async subscribe(idMe: string, idSomeUser: string): Promise<IUser> {

        if (!Types.ObjectId.isValid(idMe)) throw new BadId;
        if (!Types.ObjectId.isValid(idSomeUser)) throw new BadId;

        let userMe = await this.userModel.findById(idMe).orFail(new Error(`userMe не найден idMe = ${idMe}`));
        userMe = await userMe.execPopulate();

        let userOther = await this.userModel.findById(idSomeUser).orFail(new Error(`someUser не найден idSomeUser = ${idSomeUser}`));
        userOther = await userOther.execPopulate();
  
        if (userOther.profilePrivatType === profilePrivatType.open)
           [userMe, userOther] = this._sub(userMe, userOther)
        else
           [userMe, userOther] = this._sendSubRequest(userMe, userOther)

        await userOther.save();
        return await userMe.save();
    }
  
     // отписаться от другого пользователя
    async unSubscribe(idMe: string, idSomeUser: string): Promise<IUser> {
  
        let userMe = await (await this.userModel.findById(idMe)).execPopulate();
        let userOther = await (await this.userModel.findById(idSomeUser)).execPopulate();
        
        [userMe, userOther] = this._unSub(userMe, userOther)
  
        await userOther.save();
        return await userMe.save();
    }
  
    //todo названия userFrom, userTo отстой
    // одобрить заявку на подписку (если у вас закрытый профиль)
    async approveSubscriber(idMe: string, idSomeUser: string): Promise<IUser> {
  
        let userMe = await (await this.userModel.findById(idMe)).execPopulate();
        let userOther = await (await this.userModel.findById(idSomeUser)).execPopulate();
  
        [userOther, userMe] = this._sub(userOther, userMe);
  
        [userOther, userMe] = this._unSendSubRequest(userOther, userMe);
  
        await userOther.save();
        return await userMe.save();
    }
  
    // неодобрить заявку на подписку (если у вас закрытый профиль)
    async unApproveSubscriber(idMe: string, idSomeUser: string): Promise<IUser> {
  
        let userMe = await (await this.userModel.findById(idMe)).execPopulate();
        let userOther = await (await this.userModel.findById(idSomeUser)).execPopulate();
  
        [userOther, userMe] = this._unSendSubRequest(userOther, userMe);
  
        await userOther.save();
        return await userMe.save();
    }
  
    // прервать подписку от другого пользователя на меня (если у вас закрытый профиль)
    async deleteSubscriber(idMe: string, idSomeUser: string): Promise<IUser> {
  
        let userMe = await (await this.userModel.findById(idMe)).execPopulate();
        if (userMe.profilePrivatType === profilePrivatType.open) throw new BadRequestException();
        
        let userOther = await (await this.userModel.findById(idSomeUser)).execPopulate();
  
        [userOther, userMe] = this._unSub(userOther, userMe);
        
        await userOther.save();
        return await userMe.save();
    }

    async isSubscriber(idSubscriber: string, idSomeUser: string): Promise<boolean> {
        const user = await (await this.userModel.findById(idSomeUser)).execPopulate();
        return user.subscribers.includes(idSubscriber);
    }

    // todo названия
    private _sub(userFrom: IUser, userTo: IUser): [IUser, IUser] {

        if (userFrom === userTo) throw new BadRequestException();

        if (userFrom.subscriptions.includes(userTo._id) && userTo.subscribers.includes(userFrom._id))
            return [userFrom, userTo];

        if (userFrom.subscriptions.includes(userTo._id) || userTo.subscribers.includes(userFrom._id))
            throw new BadRequestException();

        userFrom.subscriptions.push(userTo._id);
        userTo.subscribers.push(userFrom._id);

        return [userFrom, userTo];
    }

    private _unSub(userFrom: IUser, userTo: IUser): [IUser, IUser] {

        if (userFrom === userTo) throw new BadRequestException();

        let indx = userFrom.subscriptions.findIndex(userTo._id)
        if (indx === -1) throw new BadRequestException();
        userFrom.subscriptions.splice(indx, indx);

        indx = userTo.subscribers.findIndex(userFrom._id)
        if (indx === -1) throw new BadRequestException();
        userTo.subscribers.splice(indx, indx);

        return [userFrom, userTo];
    }

    private _sendSubRequest(userFrom: IUser, userTo: IUser): [IUser, IUser] {

        if (userFrom === userTo) throw new BadRequestException();

        if (userFrom.subscrReqsFromMe.includes(userTo._id) && userTo.subscrReqsToMe.includes(userFrom._id))
        return [userFrom, userTo];

        if (userFrom.subscrReqsFromMe.includes(userTo._id) || userTo.subscrReqsToMe.includes(userFrom._id))
        throw new BadRequestException();

        userFrom.subscrReqsFromMe.push(userTo._id);
        userTo.subscrReqsToMe.push(userFrom._id);

        return [userFrom, userTo];
    }

    private _unSendSubRequest(reqFrom: IUser, reqTo: IUser): [IUser, IUser] {

        if (reqFrom === reqTo) throw new BadRequestException();

        let indx = reqFrom.subscrReqsFromMe.findIndex(reqTo._id)
        if (indx === -1) throw new BadRequestException();
        reqFrom.subscriptions.splice(indx, indx);

        indx = reqTo.subscrReqsToMe.findIndex(reqFrom._id)
        if (indx === -1) throw new BadRequestException();
        reqTo.subscribers.splice(indx, indx);

        return [reqFrom, reqTo];
    }

    private async _getUsersById(usersId: Array<string>): Promise<Array<IUser>> {

        const result = []
        await Promise.all(usersId.map(async id => {
            const model = await this.userModel.findById(id);
            if (model) result.push(model);
        }))

        return result;
    }
}