import { Controller, Get, Request, Req, Response, Post, UseGuards, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard';
import { LocalAuthGuard } from './auth/guard/local-auth.guard';
import { GoogleAuthGuard} from './auth/guard/google-auth.guard';
import { AuthService } from './auth/auth.service';
import { doesNotMatch } from 'assert';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @Get()
  getHello(): string{
    return 'hello';
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('fail')
  getFail() {
    return 'не удалось авторизироваться('
  }

  @Get("/google")
  @UseGuards(GoogleAuthGuard)
  async googleLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  // @Get("/google/redirect")
  // @UseGuards(GoogleAuthGuard)
  // async googleAuthRedirect(@Req() req): Promise<any> {
  //   return {
  //     statusCode: HttpStatus.OK,
  //     data: req.user,
  //   };
  // }

  @Get('/google/redirect')
  @UseGuards(GoogleAuthGuard)
  async g1oogleAuthRedirect(@Request() req): Promise<any> {
    return {
      statusCode: HttpStatus.OK,
      data: req.user,
    };
    console.log('redirected!!');
    
    console.log(req.user);
    const access_token = this.authService.login(req.user['email'], req.user['firstName'])
    console.log(access_token)
    if (!access_token) {
        console.log('!access token !!');
    }
    else{
      console.log('токен существует');
      console.log(access_token);
    }
    return 'okkkkkkkkkk';

    // res.redirect('http://localhost:3000/profile');
      
      // // handles the Google OAuth2 callback TODO
      // const jwt: string = req.user.jwt;
      // if (jwt) {
      //   console.log('authorizated!');
      //   res.redirect('http://localhost:3000/profile');
      // }
      // else {
      //   console.log('NOT authorizated!');
      //   res.redirect('http://localhost:3000/fail');
      // }

    //     // const access_token = this.authService.login(user['email'], user['firstName'])
    //     // console.log(access_token)
    //     // if (!access_token) {
    //     //     console.log('!access token !!')
    //     //     done(new InternalServerErrorException(), null)
    //     // }
      
  }
}
