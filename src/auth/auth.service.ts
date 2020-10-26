import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UsersService } from 'src/user/users.service';


@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  // TODO видимо сюда нужно передавать некое DTO?? 
  // так как кроме информации необходимой для создания jwt токена, нужна еще некоторая инфа из гугль аккаунта
  // здесь же нужно создовать пользователя, т.е. проверять существует он в базе данных или нет, если нет то нужно создать через UserService
  async login(user: CreateUserDto): Promise<any> {
    
    const payload = {
    userId: '1',
    username: user.givenName,
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