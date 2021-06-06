import { HttpException, HttpStatus } from '@nestjs/common';

export class Forbidden extends HttpException {
    constructor() {
        super('User have not rights to update the note.', HttpStatus.FORBIDDEN);
    }
}
