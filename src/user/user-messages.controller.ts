import { Controller, Delete, Get, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { IMessage } from 'src/message/message.interface';
import { UserMessagesService } from './user-message.service';

@Controller('message')
@UseGuards(JwtAuthGuard)
export class UserMessagesController {
    constructor(private userMessagesService: UserMessagesService) {}

    @Get('tabletop/:id')
    async getMessagesOnTable(
        @Param('id') idTable: string,
        @Request() req,
    ): Promise<IMessage[]> {
        const idMe = req.user.id;
        return this.userMessagesService.getAll(idMe, idTable);
    }

    @Delete(':id')
    async deleteMessage(@Param('id') idMessage: string): Promise<IMessage> {
        return this.userMessagesService.removeMessage(idMessage);
    }
}
