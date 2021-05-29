import { HttpException, HttpStatus } from '@nestjs/common';

export class BadId extends HttpException {
    constructor() {
        super('Invalid user id', HttpStatus.BAD_REQUEST);
    }
}
