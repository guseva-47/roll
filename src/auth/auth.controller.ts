import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { GoogleAuthGuard } from './guard/google-auth.guard';
import { AuthService } from './auth.service';
import { ITokenObject } from './interface/tokens-object.interface';
import { InvalidRefreshToken } from './exception/invalid-refresh-token.exception';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin(): Promise<HttpStatus> {
    return HttpStatus.OK;
  }

  @Get('/google/redirect')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res): Promise<any> {
    // todo шифрование и подпись рефреш токена
    const tokens: ITokenObject = await this.authService.login(req.user);
    console.log(req.cookies);
    // {
    //     domain: process.env.DOMAIN_NAME,
    //     path:'/auth',
    //     maxAge: 3600 * 48,
    //     secure: false,
    //     httpOnly: true,
    //     signed: false
    // }
    res.cookie('refresh_token', tokens.refresh_token, {
      maxAge: 3600 * 24,
      httpOnly: true,
      // path:'/auth', todo включить после отладки
    });

    res.redirect('/ok');
  }

  @Get('/refresh-token') // TODO POST!
  async refreshToken(@Req() req: Request, @Res({passthrough:true}) res: Response) {
    // проверить, что рефреш токен 1)есть, 2)устарел
    // вызвать метод обновления токена, как создание, но не нужно изменять время создания
    console.log('req.cookies');
    console.log(req.cookies);
    const refreshToken = req.cookies.refresh_token;
    if (typeof refreshToken === 'undefined') throw new InvalidRefreshToken();
    console.log('0 ok');
    const tokens: ITokenObject = await this.authService.refresh(refreshToken);

    res.cookie('refresh_token', tokens.refresh_token, {
      maxAge: 3600 * 24,
      httpOnly: false,
      // path:'/auth', todo включить после отладки
    });
    res.header('Authorization', tokens.token_type + ' ' + tokens.access_token);

    console.log('logining token payload ');
    console.log(tokens);
  }
}
