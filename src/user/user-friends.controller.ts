import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UserFriendsService } from './user-friends.service';

@Controller()
export class UserFriendsController {
  constructor(
    private friendsService: UserFriendsService,
    ) {}

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

    @Post('sub')
    @UseGuards(JwtAuthGuard)
    async subscribe(@Body() idSomeUSer: string, @Request() req) {
        const idMe = req.user.id;
        return this.friendsService.subscribe(idMe, idSomeUSer);

    }

    @Post('unsub')
    @UseGuards(JwtAuthGuard)
    async unSubscribe(@Body() idSomeUSer: string, @Request() req) {
        const idMe = req.user.id;
        return this.friendsService.unSubscribe(idMe, idSomeUSer);
    }

    @Post('approvesub')
    @UseGuards(JwtAuthGuard)
    async approveSubscribe(@Body() idSomeUSer: string, @Request() req) {
        const idMe = req.user.id;
        return this.friendsService.approveSubscriber(idMe, idSomeUSer);
    }

    @Post('unapprovesub')
    @UseGuards(JwtAuthGuard)
    async unApproveSubscribe(@Body() idSomeUSer: string, @Request() req) {
        const idMe = req.user.id;
        return this.friendsService.unApproveSubscriber(idMe, idSomeUSer);
    }

    @Delete('sub')
    @UseGuards(JwtAuthGuard)
    async deleteSubscriber(@Body() idSomeUSer: string, @Request() req) {
        const idMe = req.user.id;
        return this.friendsService.deleteSubscriber(idMe, idSomeUSer);
    }

}