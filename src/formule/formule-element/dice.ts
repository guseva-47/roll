import { Injectable, Logger, LoggerService } from "@nestjs/common";

@Injectable()
export class Dice implements IValue {

    private readonly logger: LoggerService = new Logger(Dice.name);
    
    constructor(
        private readonly amountOfFaces: number,
        private readonly randome: IRand,
    ) {}

    calc(): number {
        this.logger.log(`calc(). Значение кубика d${this.amountOfFaces}.`);

        return this._randome();
    }

    private _randome() : number {
        return this.randome.getNums(1, this.amountOfFaces, 1)[0];
    }
}