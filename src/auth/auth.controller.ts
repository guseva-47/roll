import { Controller, Get, Request, Response, UseGuards, HttpStatus, Post } from '@nestjs/common';
import { GoogleAuthGuard } from './guard/google-auth.guard';
import { AuthService } from './auth.service';
import { ITokenObject } from './interface/tokens-object.interface';
import { InvalidRefreshToken } from './exception/invalid-refresh-token.exception';


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Get("/google")
    @UseGuards(GoogleAuthGuard)
    async googleLogin(): Promise<HttpStatus> {
        return HttpStatus.OK;
    }

    @Get('/google/redirect')
    @UseGuards(GoogleAuthGuard)
    async googleAuthRedirect(@Request() req, @Response() res): Promise<any> {

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

    @Get('refresh-token') // TODO POST!
    async refreshToken(@Request() req, @Response() res): Promise<any> {
        // проверить, что рефреш токен 1)есть, 2)устарел
        // вызвать метод обновления токена, как создание, но не нужно изменять время создания
        console.log(req.cookies)
        const refreshToken = req.cookies.refresh_token;
        if (typeof refreshToken === 'undefined') throw new InvalidRefreshToken;
        console.log('0 ok')
        const tokens: ITokenObject = await this.authService.refresh(refreshToken);
        
        res.cookie('refresh_token', tokens.refresh_token, {
            maxAge: 3600 * 24,
            httpOnly: true,
            // path:'/auth', todo включить после отладки
        });
        console.log('logining token payload ');
        console.log(tokens);
        res.redirect('/');
    }
}
