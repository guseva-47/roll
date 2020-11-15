import { BadRequestException, Controller, Get, Param, Put, Request, Body, Response, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard';
import { UserService } from './user/user.service';
import { UserDto } from './user/dto/user.dto';

@Controller()
export class AppController {
    constructor(
        private userService: UserService,
    ) { }

    @Get()
    getHello(): string {
        return 'hello';
    }

    @Get('login')
    getLogin(@Response() res) {
        res.redirect('/auth/google');
    }

    @Get('fail')
    getFail() {
        return 'не удалось авторизироваться(';
    }

    @Get('ok')
    @UseGuards(JwtAuthGuard)
    getOk(@Request() req) {
        return req.user;
    }

    @Get('allUsers')
    async getAll() {
        return this.userService.allUsers();
    }

    @Get('deleteall')
    async getDeleteAllUsers() {
        return this.userService.deleteAllUsers();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Param('id') idSomeUser: string, @Request() req) {

        const idMe = req.user.id

        if (idMe === idSomeUser)
            return this.userService.getUser(idMe);
        
        return this.userService.getUser(idMe, idSomeUser);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async editProfile(@Body() userDto: UserDto, @Request() req) {

        const idMe = req.user.id;
        if (idMe !== userDto._id) throw new BadRequestException();
        return this.userService._updateProfile(userDto)
    }
}
