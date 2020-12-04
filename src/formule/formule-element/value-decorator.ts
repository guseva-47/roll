import { Injectable, Logger, LoggerService } from "@nestjs/common";

@Injectable()
export class ValueDecorator implements IValue {
    private readonly loggerOfDecor: LoggerService = new Logger(ValueDecorator.name);

    constructor(private readonly value: IValue) {}

    calc(): number {
        this.loggerOfDecor.log('calc(). Деекоратор.');
        return this.value.calc();
    }
}