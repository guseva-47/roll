import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { TrueRandomeService } from 'src/true-randome/true-randome.service';

import { Formula } from './formula-element/formula';

@Injectable()
export class FormulaService {
    private readonly logger: LoggerService = new Logger(FormulaService.name);

    constructor(private readonly randome: TrueRandomeService) {}

    getResult(str: string) {
        this.logger.log(`getResult(). Вычислить результат формулы str = ${str}`);

        const formula = new Formula(this.randome, str);

        const result = formula.calculate();
        this.logger.log(`Результат = ${result}`);
        return result;
    }
}
