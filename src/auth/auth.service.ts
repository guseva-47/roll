import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';


@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService
  ) {}

  async login(userDto: CreateUserDto): Promise<any> {
    
    let existedUser;

    const ishave = await this.usersService.isExist(userDto);
    if (!ishave)
        existedUser = await this.usersService.createUser(userDto).catch(e => console.error(e));
    else
        existedUser = await this.usersService.findByCreateUserDto(userDto).catch(e => console.error(e));
    
    const payload = {
      userId: existedUser._id,
      email: existedUser.email,
    }

    console.log('auth servise перед созданием токена')
    console.log(payload)

    const accessToken = this.jwtService.sign(payload)
    console.log(accessToken)
    return {
      accessToken: accessToken,
    };
  }
}