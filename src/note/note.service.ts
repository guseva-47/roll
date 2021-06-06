import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NoteDto } from './dto/note.dto';
import { NoteSecureMode } from './enum/note-secure-mode.enum';
import { BadId } from './exseption/bad-id.exception';
import { Forbidden } from './exseption/forbidden.exception';
import { NoteNotFound } from './exseption/note-undefind.exception';
import { INote } from './interface/note.interface';

@Injectable()
export class NoteService {
    constructor(@InjectModel('Note') private readonly noteModel: Model<INote>) {}

    // все одного стола
    async getAllNotesFromTable(idUser: string, idTable: string): Promise<INote[]> {
        let allNoteFromTable = await this.noteModel.find({ tabletop: idTable });
        allNoteFromTable = allNoteFromTable.filter(note =>
            this._isHaveRights(note, idUser),
        );
        return allNoteFromTable;
    }

    async getById(idNote: string): Promise<INote> {
        if (!Types.ObjectId.isValid(idNote)) throw new BadId();
        return await this.noteModel.findById(idNote).orFail(new NoteNotFound());
    }

    // создать
    async createNote(note: NoteDto): Promise<INote> {
        if (!Types.ObjectId.isValid(note.author))
            throw new HttpException('Bad author id', HttpStatus.BAD_REQUEST);
        if (!Types.ObjectId.isValid(note.tabletop))
            throw new HttpException('Bad tabletop id', HttpStatus.BAD_REQUEST);

        const { _id, ...rest } = note;
        const newNote = new this.noteModel(rest);
        return newNote.save();
    }

    // изменить
    async updateNote(idUser: string, note: NoteDto): Promise<INote> {
        if (!Types.ObjectId.isValid(note._id)) throw new BadId();

        const noteFromDB = await this.noteModel
            .findById(note._id)
            .orFail(new NoteNotFound());
        if (!this._isHaveRights(noteFromDB, idUser)) throw new Forbidden();

        await noteFromDB.updateOne(note).orFail(new NoteNotFound());

        return (await this.noteModel.findById(note._id)).execPopulate();
    }

    // удалить
    async removeNote(idNote: string, idUser: string): Promise<INote> {
        const noteFromDB = await this.noteModel.findById(idNote);
        if (!this._isHaveRights(noteFromDB, idUser)) throw new Forbidden();

        return await noteFromDB.deleteOne();
    }

    private _isHaveRights(note: INote, idUser: string) {
        return note.author + '' == idUser + '' || note.secureMode == NoteSecureMode.all;
    }
}
