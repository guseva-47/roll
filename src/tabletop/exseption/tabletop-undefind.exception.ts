import { HttpException, HttpStatus } from "@nestjs/common";

export class TabletopNotFound extends HttpException {
    constructor() {
      super('Tabletop not found', HttpStatus.NOT_FOUND);
    }
}