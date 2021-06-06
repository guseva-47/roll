import {
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { MessageDto } from 'src/message/message.dto';
import { IMessage } from 'src/message/message.interface';
import { MessageService } from 'src/message/message.service';
import { UserTabletopsService } from './user-tabletops.service';

@Injectable()
export class UserMessagesService {
    constructor(
        private userTabletopService: UserTabletopsService,
        private messageService: MessageService,
    ) {}

    async getAll(idMe: string, idTabletop: string): Promise<IMessage[]> {
        if (!this.userTabletopService.isUserRelateToTable(idMe, idTabletop))
            throw new ForbiddenException("User don't have relate to the table");
        return await this.messageService.getAllMessagesFromTable(idTabletop);
    }

    async isAuthorHaveRights(message: MessageDto | IMessage): Promise<boolean> {
        if (!Types.ObjectId.isValid(message.tabletop)) return false;
        if (!Types.ObjectId.isValid(message.author)) return false;

        return await this.userTabletopService.isUserRelateToTable(
            message.author,
            message.tabletop,
        );
    }

    async removeMessage(idMessage: string): Promise<IMessage> {
        return await this.messageService.removeMessage(idMessage);
    }
}
