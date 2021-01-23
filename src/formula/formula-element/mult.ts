import { Injectable, Logger, LoggerService } from "@nestjs/common";

@Injectable()
export class Mult implements IValue {
    private readonly logger: LoggerService = new Logger(Mult.name);
    constructor(
        private readonly list: IValue[],
    ) {}

    calc(): number {
        this.logger.log(`calc(). Умножение.`);
        return this.list[0].calc() * this.list[1].calc();
    }

    clone(): Mult {
        this.logger.log('clone()');
        const newList = this.list.map(current => current.clone());
        return new Mult(newList);
    }
}