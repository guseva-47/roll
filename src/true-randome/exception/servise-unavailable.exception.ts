import { HttpException, HttpStatus } from "@nestjs/common";

export class ServiceUnavailable extends HttpException {
    constructor() {
        super('Servise random.org is unvailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
}