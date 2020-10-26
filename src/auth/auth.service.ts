import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  // async validateUser(username: string, pass: string): Promise<any> {
  //   const user = await this.usersService.findOne(username);
  //   if (user && user.password === pass) {
  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //     const { password, ...result } = user;
  //     return result;
  //   }
  //   return null;
  // }

  // TODO видимо сюда нужно передавать некое DTO?? 
  // так как кроме информации необходимой для создания jwt токена, нужна еще некоторая инфа из гугль аккаунта
  // здесь же нужно создовать пользователя, т.е. проверять существует он в базе данных или нет, если нет то нужно создать через UserService
  async login(username: string, userId: string): Promise<any> {
    const payload = { username: username, sub: userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}