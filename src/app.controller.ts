import { Controller, Get, Request, Response, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @Get()
  getHello(): string{
    return 'hello';
  }

  @Get('login')
  getLogin(@Response() res) {
      console.log('login go')
      res.redirect('http://localhost:3000/auth/google');
  }

  @Get('fail')
  getFail() {
      return 'не удалось авторизироваться('
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
      console.log('Авторизировано!')
      console.log(req.user)
      return req.user;
  }
}
