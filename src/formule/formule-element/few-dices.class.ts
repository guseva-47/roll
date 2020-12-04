import { Injectable, Logger, LoggerService } from "@nestjs/common";
import { ValueDecorator } from "./value-decorator";

@Injectable()
export class FewDices extends ValueDecorator {

    private readonly logger: LoggerService = new Logger(FewDices.name);

    constructor(
        private readonly dice: IValue, 
        private readonly diceCount: number
    ) {
        super(dice);
    }

    calc(): number {
        this.logger.log(`calc(). ${this.diceCount} раз бросается кость.`);
        let sum = 0;
        for (let i = 0; i < this.diceCount; i++)
            sum += this.dice.calc();

        return sum;
    }
}