import { Injectable, Logger, LoggerService } from "@nestjs/common";
import { TrueRandomeService } from "src/true-randome/true-randome.service";

import { Formula } from './formula-element/formula';

@Injectable()
export class FormulaService {
    private readonly logger: LoggerService = new Logger(FormulaService.name);

    formulBackup; //  class Formula.Momento -- Momento - внутренний класс для Formula
    constructor(private readonly randome: TrueRandomeService) {}

    getResult(str: string) {
        this.logger.log(`getResult(). Вычислить результат формулы str = ${str}`);

        const formula = new Formula(this.randome, str);
        const iter = formula.getIterator();

        this.logger.log(`getResult(). Вывод этапов рассчета формулы.`);
        while (str = iter.getNext())
            this.logger.log(`${str}`);

        const result = formula.calculate();
        this.logger.log(`Результат = ${result}`);
        return result;
    }

    getFormulaBackup(formula: Formula) {
        this.logger.log('getFormulaBackup(). Создание снимка.')
        this.formulBackup = formula.createSnapshot();
    }

    setFormulaBack() {
        this.logger.log('setFormulaBack(). Восстановление формулы по снимку.')
        if (this.formulBackup)
            return this.formulBackup.restore();
        return null;
    }
}