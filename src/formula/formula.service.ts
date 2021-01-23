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

    test(str: string, num: number) {
        const newRand = class R implements IRand {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            sowing() {}
            getNums(min: number, max: number, count: number): number[] {
                const result = new Array<number>();
                for (let i = 0; i < count; i++) result.push(min);
                return result;
            }

        }
        const logSixCalc = (formula: Formula) => {
            const result = new Array<number>();
            for (let i = 0; i < 6; i++) {
                result.push(formula.calculate());
            }
            this.logger.log(`test(). Результаты шести бросков = ${result}`);
        }

        this.logger.log(`test(). Создание формулы ${str}`);
        const formula = new Formula(this.randome, str);
        logSixCalc(formula);

        this.getFormulaBackup(formula);
       
        formula.setRandomiser(new newRand());
        this.logger.log(`test(). Замена рандомайзера в формуле. Теперь он будет всегда возвращать ${num}.`);
        logSixCalc(formula);

        this.logger.log(`test(). Восстановление формулы.`);
        const back = this.setFormulaBack();
        this.logger.log(`test(). Восстановленная формула и текущая - один объект is ${back == formula}`);
        logSixCalc(formula);
    }
}
