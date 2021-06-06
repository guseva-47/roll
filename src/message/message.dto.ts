import { IsNotEmpty } from 'class-validator';

export class MessageDto {
    @IsNotEmpty()
    _id: string;
    text: string;
    date: Date;
    author: string;
    tabletop: string;
}