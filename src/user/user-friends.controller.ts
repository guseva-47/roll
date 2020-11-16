import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UserFriendsService } from './user-friends.service';

@Controller()
export class UserFriendsController {
  constructor(
    private friendsService: UserFriendsService,
    ) {}

    @Post('/sub')
    @UseGuards(JwtAuthGuard)
    async subscribe(@Body() someUser: { id:string }, @Request() req) {
        const idMe = req.user.id;
        return this.friendsService.subscribe(idMe, someUser.id);
    }

    @Post('unsub')
    @UseGuards(JwtAuthGuard)
    async unSubscribe(@Body()someUser: { id:string }, @Request() req) {
        const idMe = req.user.id;
        return this.friendsService.unSubscribe(idMe, someUser.id);
    }

    @Get(':id/subscribers')
    @UseGuards(JwtAuthGuard)
    async getSubscribers(@Param('id') idSomeUser: string, @Request() req) {
      const idMe = req.user.id;
      if (idMe === idSomeUser)
        return await this.friendsService.getSubscribers(idMe);
      
      return await this.friendsService.getSubscribers(idMe, idSomeUser);
    }

    @Get(':id/subscriptions')
    @UseGuards(JwtAuthGuard)
    async getSubscriptions(@Param('id') idSomeUser: string, @Request() req) {
        const idMe = req.user.id;
        if (idMe === idSomeUser)
          return await this.friendsService.getSubscriptions(idMe);
        
        return await this.friendsService.getSubscriptions(idMe, idSomeUser);
    }

    @Post('approvesub')
    @UseGuards(JwtAuthGuard)
    async approveSubscribe(@Body() someUser: { id:string }, @Request() req) {
        const idMe = req.user.id;
        return this.friendsService.approveSubscriber(idMe, someUser.id);
    }

    @Post('unapprovesub')
    @UseGuards(JwtAuthGuard)
    async unApproveSubscribe(@Body() someUser: { id:string }, @Request() req) {
        const idMe = req.user.id;
        return this.friendsService.unApproveSubscriber(idMe, someUser.id);
    }

    @Delete('sub')
    @UseGuards(JwtAuthGuard)
    async deleteSubscriber(@Body() someUser: { id:string }, @Request() req) {
        const idMe = req.user.id;
        return this.friendsService.deleteSubscriber(idMe, someUser.id);
    }

}