import { Controller, Get, Param, Put, UseGuards, Body, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller()
export class UserController {

    constructor(
        private userService: UserService,
    ) {}
    
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
        return this.userService.editProfile(userDto)
    }
}
