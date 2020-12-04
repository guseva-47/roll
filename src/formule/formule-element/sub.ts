import { Injectable, Logger, LoggerService } from "@nestjs/common";

@Injectable()
export class Sub implements IValue {
    private readonly logger: LoggerService = new Logger(Sub.name);

    constructor(
        private readonly list: IValue[],
    ) {}

    calc(): number {
        this.logger.log('calc(). Вычитание.');
        return this.list[0].calc() - this.list[1].calc();
    }
}