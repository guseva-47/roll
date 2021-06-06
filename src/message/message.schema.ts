import * as mongoose from 'mongoose';

export const MessageSchema = new mongoose.Schema({
    text: { type: String, required: false },
    author: { type: mongoose.Schema.Types.ObjectId, required: false },
    tabletop: { type: mongoose.Schema.Types.ObjectId, required: false },
    date: { type: Date, required: false },
})