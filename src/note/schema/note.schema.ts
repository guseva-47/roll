import * as mongoose from 'mongoose';
import { NoteSecureMode } from '../enum/note-secure-mode.enum';

export const NoteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    text: { type: String, required: false },
    author: { type: mongoose.Schema.Types.ObjectId, required: false },
    tabletop: { type: mongoose.Schema.Types.ObjectId, required: false },
    date: { type: Date, required: false },
    secureMode: {
        type: String,
        required: false,
        default: NoteSecureMode.author_only,
        enum: Object.values(NoteSecureMode),
    },
});
