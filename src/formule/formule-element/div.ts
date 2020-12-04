import { Injectable } from "@nestjs/common";

@Injectable()
export class Div implements IValue {
    constructor(
        private readonly list: IValue[],
    ) {}

    calc(): number {
        return this.list[0].calc() / this.list[1].calc();
    }
}