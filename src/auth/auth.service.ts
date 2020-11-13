import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { IJwtPayload } from './interface/jwt-payload.interfase';


@Injectable()
export class AuthService {
    constructor(
        private usersService: UserService,
        private jwtService: JwtService
    ) { }

    async login(userDto: CreateUserDto): Promise<any> {

        let existedUser;

        const ishave = await this.usersService.isExist(userDto);
        if (!ishave)
            existedUser = await this.usersService.createUser(userDto).catch(e => console.error(e));
        else
            existedUser = await this.usersService.findByCreateUserDto(userDto).catch(e => console.error(e));

        const payload: IJwtPayload = {
            id: existedUser._id,
            email: existedUser.email,
        }

        const accessToken = this.jwtService.sign(payload)
        console.log('logining accses token payload ')
        console.log(payload)
        console.log(accessToken)
        return {
            accessToken: accessToken,
        };
    }
}