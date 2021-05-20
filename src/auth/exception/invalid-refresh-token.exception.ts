import { HttpException, HttpStatus } from "@nestjs/common";

export class InvalidRefreshToken extends HttpException {
    constructor() {
        super('Invalid refresh token', HttpStatus.FORBIDDEN);
    }
}