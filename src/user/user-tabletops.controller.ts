import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { identity } from 'rxjs';
import { TabletopDto } from 'src/tabletop/dto/tabletop.dto';
import { ITabletop } from 'src/tabletop/interface/tabletop.interface';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UserFriendsService } from './user-friends.service';
import { UsersTabletopsService } from './user-tabletops.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class UserTabletopsController {
    constructor(
        private userTabletopsService: UsersTabletopsService,
        private userFriendsService: UserFriendsService,
        ) {}

    @Get(':id/tabletops')
    async getAllTabletops(@Param('id') idSomeUser: string, @Request() req) {
        
        const idMe = req.user.id
        if (idMe === idSomeUser)
            return await this.userTabletopsService.getAllTabletops(idMe);
        
        return await this.userTabletopsService.getAllTabletops(idMe, idSomeUser);
    }

    @Get('tabletops/:idTable')
    async getTabletop(
        @Param('idTable') idTable: string, 
        @Request() req): Promise<ITabletop> 
    {
        const idMe = req.user.id
        return await this.userTabletopsService.getTabletop(idMe, idTable);        
    }

    // @Put('tabletops/edit/owner')
    // async rightTransfer(
    //     @Body() idSomeUser: string,
    //     @Body() tabletopDto: TabletopDto, 
    //     @Request() req): Promise<ITabletop> 
    // {
    //     const idMe = req.user.id
    //     return this.userTabletopsService.rightTransfer(idMe, idSomeUser, tabletopDto);
    // }

    @Put('tabletops/edit')
    async editTabletop(@Body() tabletopDto: TabletopDto, @Request() req): Promise<ITabletop> 
    {
        const idMe = req.user.id
        return await this.userTabletopsService.editTabletop(idMe, tabletopDto);
    }

    @Delete('tabletops/:idTable')
    async deleteTabletop(@Param('idTable') idTable: string, @Request() req): Promise<ITabletop> 
    {
        const idMe = req.user.id
        return await this.userTabletopsService.removeTabletop(idMe, idTable);        
    }

    @Post('tabletops/:idTable')
    async postTabletop(@Param('idTable') tabletopDto: TabletopDto, @Request() req): Promise<ITabletop> 
    {
        const idMe = req.user.id
        return await this.userTabletopsService.createTabletop(idMe, tabletopDto);        
    }



}