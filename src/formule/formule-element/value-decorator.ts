import { Injectable, Logger, LoggerService } from "@nestjs/common";

@Injectable()
export class ValueDecorator implements IValue {
    private readonly loggerOfDecor: LoggerService = new Logger(ValueDecorator.name);

    constructor(private readonly value: IValue) {}

    calc(): number {
        this.loggerOfDecor.log('calc(). Декоратор.');
        return this.value.calc();
    }

    clone(): ValueDecorator {
        this.loggerOfDecor.log('clone()');
        return new ValueDecorator(this.value.clone());
    }
}