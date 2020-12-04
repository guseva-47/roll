import { Injectable, Logger, LoggerService } from "@nestjs/common";

@Injectable()
export class Constant implements IValue {
    private readonly logger: LoggerService = new Logger(Constant.name);
    constructor(
        private readonly value: number,
    ) {}

    calc(): number {
        this.logger.log('calc(). Константа.');
        return this.value;
    }
}