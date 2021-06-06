import { Document } from 'mongoose';
import { NoteSecureMode } from '../enum/note-secure-mode.enum';

export interface INote extends Document {
    readonly title: string;
    readonly text: string;
    readonly author: string;
    readonly tabletop: string;
    readonly date: Date;
    readonly secureMode: NoteSecureMode;
}
