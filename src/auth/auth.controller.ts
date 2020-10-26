import { Controller, Get, Request, Response, UseGuards, HttpStatus } from '@nestjs/common';
import { GoogleAuthGuard} from './guard/google-auth.guard';
import { AuthService } from './auth.service';


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Get("/google")
    @UseGuards(GoogleAuthGuard)
    async googleLogin(): Promise<any> {
        return HttpStatus.OK;
    }

    @Get('/google/redirect')
    @UseGuards(GoogleAuthGuard)
    async googleAuthRedirect(@Request() req, @Response() res): Promise<any> {

        const jwtToken = this.authService.login(req.user)

        res.redirect('http://localhost:3000/profile')
    }
}
