import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { NoteDto } from '../note/dto/note.dto';
import { INote } from '../note/interface/note.interface';
import { NoteService } from '../note/note.service';
import { UserTabletopsService } from './user-tabletops.service';

@Injectable()
export class UserNotesService {
    constructor(
        private userTabletopService: UserTabletopsService,
        private noteService: NoteService,
    ) {}

    async getAll(idMe: string, idTabletop: string): Promise<INote[]> {
        if (!this.userTabletopService.isUserRelateToTable(idMe, idTabletop))
            throw new ForbiddenException("User don't have relate to the table");
        return await this.noteService.getAllNotesFromTable(idMe, idTabletop);
    }

    async putNote(idMe: string, noteDto: NoteDto): Promise<INote> {
        if (!Types.ObjectId.isValid(noteDto.tabletop)) throw new BadRequestException('Tabletop id in the note is invalid.');

        if (!this.userTabletopService.isUserRelateToTable(idMe, noteDto.tabletop))
            throw new ForbiddenException("User don't have relate to the table");
        
        return await this.noteService.updateNote(idMe, noteDto);
    }

    async postNote(idMe: string, noteDto: NoteDto): Promise<INote> {
        if (!Types.ObjectId.isValid(noteDto.tabletop)) throw new BadRequestException('Tabletop id in the note is invalid.');

        if (!this.userTabletopService.isUserRelateToTable(idMe, noteDto.tabletop))
            throw new ForbiddenException("User don't have relate to the table");

        noteDto.author = idMe;        
        return await this.noteService.createNote(noteDto);
    }

    async deleteNote(idMe: string, idNote: string): Promise<INote> {
        const noteFromDB = await this.noteService.getById(idNote);

        if (!this.userTabletopService.isUserRelateToTable(idMe, noteFromDB.tabletop))
            throw new ForbiddenException("User don't have relate to the table");
        
        return await this.noteService.removeNote(idNote, idMe);
    }
}
