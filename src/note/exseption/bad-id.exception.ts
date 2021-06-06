import { HttpException, HttpStatus } from '@nestjs/common';

export class BadId extends HttpException {
    constructor() {
        super('Invalid note id', HttpStatus.BAD_REQUEST);
    }
}
