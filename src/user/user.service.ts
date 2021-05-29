import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { profilePrivatType } from './enum/profile-privet-type.enum';
import { BadId } from './exseption/bad-id.exception';
import { UserNotFound } from './exseption/user-undefind.exception';
import { IUser } from './interface/user.interface';

@Injectable()
export class UserService {
    constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

    async createUser(createUserDto: CreateUserDto): Promise<IUser> {
        if (await this.isExist(createUserDto)) throw new BadRequestException();

        const createdUser = new this.userModel(createUserDto);
        return await createdUser.save();
    }

    async findByCreateUserDto(createUserDto: CreateUserDto): Promise<IUser> {
        const email = createUserDto.email;
        const oauth2Source = createUserDto.oauth2Source;

        const user = await this.userModel
            .findOne({ email: email, oauth2Source: oauth2Source })
            .orFail(new UserNotFound());
        return await user.execPopulate();
    }

    async isExist(createUserDto: CreateUserDto): Promise<boolean> {
        return await this.userModel.exists({
            email: createUserDto.email,
            oauth2Source: createUserDto.oauth2Source,
        });
    }

    async editProfile(userDto: UserDto): Promise<IUser> {
        userDto.lastActiveAt = new Date();
        const user = await this.userModel
            .findByIdAndUpdate(userDto._id, userDto, { new: true })
            .orFail(new UserNotFound());
        return await user.execPopulate();
    }

    async getUser(idMe: string, idOther?: string): Promise<IUser> {
        if (!Types.ObjectId.isValid(idMe)) throw new BadId();
        if (idOther && !Types.ObjectId.isValid(idOther)) throw new BadId();

        if (!idOther) {
            const userPromise = await this.userModel
                .findById(idMe)
                .orFail(new UserNotFound());
            return await userPromise.execPopulate();
        }

        const userPromise = await this.userModel
            .findById(idOther)
            .orFail(new UserNotFound());
        const userOther = await userPromise.execPopulate();

        if (
            userOther.profilePrivatType === profilePrivatType.closed &&
            !userOther.subscribers.includes(idMe)
        )
            throw new ForbiddenException();

        return userOther;
    }

    async allUsers(): Promise<any> {
        return await this.userModel.find().exec();
    }

    async deleteAllUsers(): Promise<any> {
        return await this.userModel
            .find()
            .remove()
            .exec();
    }
}
