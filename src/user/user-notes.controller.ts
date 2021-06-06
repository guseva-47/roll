import {
    Controller,
    Get,
    UseGuards,
    Put,
    Body,
    Post,
    Delete,
    Param,
    Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { NoteDto } from '../note/dto/note.dto';
import { INote } from '../note/interface/note.interface';
import { UserNotesService } from './user-notes.service';

@Controller('note')
@UseGuards(JwtAuthGuard)
export class UserNotesController {
    constructor(private userNotesService: UserNotesService) {}

    @Get('tabletop/:id')
    async getNotesOnTable(
        @Param('id') idTable: string,
        @Request() req,
    ): Promise<INote[]> {
        const idMe = req.user.id;
        return this.userNotesService.getAll(idMe, idTable);
    }

    @Put('tabletop')
    async putNoteOnTable(@Body() noteDto: NoteDto, @Request() req): Promise<INote> {
        const idMe = req.user.id;
        return this.userNotesService.putNote(idMe, noteDto);
    }

    @Post('tabletop')
    async postNoteOnTable(@Body() noteDto: NoteDto, @Request() req): Promise<INote> {
        const idMe = req.user.id;
        return this.userNotesService.postNote(idMe, noteDto);
    }

    @Delete(':id')
    async deleteNote(@Param('id') idNote: string, @Request() req): Promise<INote> {
        const idMe = req.user.id;
        return this.userNotesService.deleteNote(idMe, idNote);
    }
}
