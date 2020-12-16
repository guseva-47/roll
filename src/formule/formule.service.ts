import { Injectable, Logger, LoggerService } from "@nestjs/common";
import { TrueRandomeService } from "src/true-randome/true-randome.service";

import { Formule } from './formule-element/formule';

@Injectable()
export class FormuleService {
    private readonly logger: LoggerService = new Logger(FormuleService.name);

    constructor(private readonly randome: TrueRandomeService) {}

    getResult(str: string) {
        this.logger.log(`getResult(). Вычислить результат формулы str = ${str}`);

        const formula = new Formule(this.randome, str);
        const iter = formula.getIterator();

        this.logger.log(`getResult(). Вывод этапов рассчета формулы.`);
        while (str = iter.getNext())
            this.logger.log(`${str}`);

        const result = formula.calculate();
        this.logger.log(`Результат = ${result}`);
        return result;
    }
}
