import { Injectable, Logger, LoggerService } from "@nestjs/common";
import { ValueDecorator } from "./value-decorator";

@Injectable()
export class Adventage extends ValueDecorator {
    
    private readonly logger: LoggerService = new Logger(Adventage.name);

    constructor(
        private readonly dice: IValue,
    ) {
        super(dice);
    }

    calc(): number {
        this.logger.log('calc(). "бросок с преимуществом".');
        const list: number[] = [this.dice.calc(), this.dice.calc()];
        if (list[0] < list[1])
            return list[1];
        return list[0];
    }
}