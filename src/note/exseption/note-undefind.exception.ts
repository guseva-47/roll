import { HttpException, HttpStatus } from '@nestjs/common';

export class NoteNotFound extends HttpException {
    constructor() {
        super('Note not found', HttpStatus.NOT_FOUND);
    }
}
