import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { FormulaService } from 'src/formula/formula.service';
import { MessageDto } from '../message/message.dto';
import { MessageService } from '../message/message.service';
import { UserMessagesService } from './user-message.service';

@WebSocketGateway()
export class ChatGateway {
    constructor(
        private messageService: MessageService,
        private userMessagesService: UserMessagesService,
        private formulaService: FormulaService
    ) {}

    @WebSocketServer()
    server: Server;

    @SubscribeMessage('message')
    async handleMessage(
        @MessageBody() messageBody: { data: MessageDto },
        @ConnectedSocket() client,
    ): Promise<void> {
        const mes = messageBody.data;
        console.log(mes);

        if (!this.userMessagesService.isAuthorHaveRights(mes)) return;

        const mesFromDb = await this.messageService.createMessage(mes);
        this.server.emit('message', { data: mesFromDb });
    }

    @SubscribeMessage('roll')
    async handleRoll(
        @MessageBody() messageBody: { data: MessageDto },
        @ConnectedSocket() client,
    ): Promise<void> {
        const formula = messageBody.data.text;
        console.log(formula);
        if (formula.length == 0) {
            messageBody.data.text = '0';
            this.server.emit('message', messageBody);
        }
        else {
            messageBody.data.text = this.formulaService.getResult(formula).toString();
            this.server.emit('message', messageBody);
        }
    }
}
