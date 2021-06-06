import { IsNotEmpty } from 'class-validator';
import { NoteSecureMode } from '../enum/note-secure-mode.enum';

export class NoteDto {
    @IsNotEmpty()
    _id: string;
    title: string;
    text: string;
    author: string;
    tabletop: string;
    date: Date;
    secureMode: NoteSecureMode;
}
