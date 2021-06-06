import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MessageDto } from './message.dto';
import { IMessage } from './message.interface';

@Injectable()
export class MessageService {
    constructor(@InjectModel('Message') private readonly messageModel: Model<IMessage>) {}

    async getAllMessagesFromTable(idTable: string): Promise<IMessage[]> {
        return await this.messageModel.find({ tabletop: idTable });
    }

    async createMessage(message: MessageDto): Promise<IMessage> {
        if (!Types.ObjectId.isValid(message.author))
            throw new HttpException('Bad author id', HttpStatus.BAD_REQUEST);
        if (!Types.ObjectId.isValid(message.tabletop))
            throw new HttpException('Bad tabletop id', HttpStatus.BAD_REQUEST);

        const { _id, ...rest } = message;
        const newMessage = new this.messageModel(rest);
        return newMessage.save();
    }

    async getById(idMessage: string): Promise<IMessage> {
        if (!Types.ObjectId.isValid(idMessage))
            throw new HttpException('Bad message id', HttpStatus.BAD_REQUEST);

        return await this.messageModel
            .findById(idMessage)
            .orFail(new HttpException('Message not found', HttpStatus.NOT_FOUND));
    }

    async removeMessage(idMessage: string): Promise<IMessage> {
        return await this.messageModel.findByIdAndDelete(idMessage);
    }
}
