import { Injectable } from "@nestjs/common";

@Injectable()
export class Pow implements IValue {
    constructor(
        private readonly list: IValue[],
    ) {}

    calc(): number {
        return Math.pow(this.list[0].calc(), this.list[1].calc());
    }
    clone(): Pow {
        const newList = this.list.map(current => current.clone());
        return new Pow(newList);
    }
}