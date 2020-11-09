import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { profilePrivatType } from './enum/profile-privet-type.enum';
import { IUser } from './interface/user.interface';

@Injectable()
export class UserService {
   constructor(@InjectModel('User') private readonly userModel: Model<IUser>){}

   async createUser(createUserDto: CreateUserDto): Promise<IUser> {

      if ( await this.isExist(createUserDto)) throw new BadRequestException();
      
      const createdUser = new this.userModel(createUserDto);
      return await createdUser.save();
   }

   async findByCreateUserDto(createUserDto: CreateUserDto): Promise<IUser> {

      const email = createUserDto.email;
      const oauth2Source = createUserDto.oauth2Source;

      return await (await this.userModel.findOne({email: email, oauth2Source: oauth2Source})).execPopulate();
   }

   async isExist(createUserDto: CreateUserDto): Promise<boolean> {

      return await this.userModel.exists(
         {
            email: createUserDto.email,
            oauth2Source: createUserDto.oauth2Source,         
         }
      );
   }

   async updateProfile(userDto: UserDto): Promise<IUser> {

      userDto.lastActiveAt = new Date();
      return await (await this.userModel.findByIdAndUpdate(userDto._id, userDto)).execPopulate();
   }

   async getUser(idMe: string, idOther?: string): Promise<IUser> {
      if (!idOther)
         return (await this.userModel.findById(idMe)).execPopulate();

      const userOther = await (await this.userModel.findById(idOther)).execPopulate();

      if (userOther.profilePrivatType === profilePrivatType.closed && !userOther.subscribers.includes(idMe)) 
          throw new BadRequestException;
      
      return (await this.userModel.findById(idOther)).execPopulate();
   }

  
   async allUsers(): Promise<any> {
      // const ids = ["5f9db481d5aac30d2094c5a5", "5f99efcb69487b339ceed48f"]
      // const result = new Array<IUser>();

      // // todo порционный вывод
      // await Promise.all(ids.map(async id => {
      //    const model = await this.userModel.findById(id)
      //    result.push(model);
      // }))

      // return result;
      
      return await this.userModel.find().exec();      
   }

   async deleteAllUsers(): Promise<any> {

      return await this.userModel.find().remove().exec();
   }
}
