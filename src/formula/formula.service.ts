import { Injectable, Logger, LoggerService } from "@nestjs/common";
import { TrueRandomeService } from "src/true-randome/true-randome.service";

import { Formula } from './formula-element/formula';
import { FormulaSub } from "./formula-element/formula-sub";
import { RandPublisher } from "./formula-element/randpublisher";

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

    testMemento(str: string, num: number) {
        const newRand1 = class R1 implements IRand {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            sowing() {}
            getNums(min: number, max: number, count: number): number[] {
                const result = new Array<number>();
                for (let i = 0; i < count; i++) result.push(min);
                return result;
            }
        }
        const newRand2 = class R2 implements IRand {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            sowing() {}
            getNums(min: number, max: number, count: number): number[] {
                const result = new Array<number>();
                const a = [min, max]
                for(let i = 0; i < count; i++) {
                    const indx = Math.round(Math.random() * 100) % 2
                    result.push(a[indx]);
                }
                return result;
            }
        }
        const logSixCalc = (formula: Formula) => {
            const result = new Array<number>();
            for (let i = 0; i < 6; i++) {
                result.push(formula.calculate());
            }
            this.logger.log(`testMemento(). Результаты шести бросков = ${result}`);
        }

        this.logger.log(`testMemento(). Создание формулы ${str}`);
        const formula = new Formula(this.randome, str);
        logSixCalc(formula);

        this.getFormulaBackup(formula);
       
        formula.setRandomiser(new newRand1());
        this.logger.log(`testMemento(). Замена рандомайзера в формуле. Теперь он будет всегда возвращать ${num}.`);
        logSixCalc(formula);

        formula.setRandomiser(new newRand2());
        this.logger.log(`testMemento(). Замена рандомайзера в формуле. Теперь он будет всегда возвращать min или max.`);
        logSixCalc(formula);

        this.logger.log(`testMemento(). Восстановление формулы.`);
        const back1 = this.setFormulaBack();
        this.logger.log(`testMemento(). Восстановленная формула и текущая - один объект is ${back1 == formula}`);
        logSixCalc(formula);

        formula.setRandomiser(new newRand2());
        this.logger.log(`testMemento(). Замена рандомайзера в формуле. Теперь он будет всегда возвращать min или max.`);
        logSixCalc(formula);

        this.getFormulaBackup(formula);

        formula.setRandomiser(this.randome);
        this.logger.log(`testMemento(). Замена рандомайзера на обычный.`);
        logSixCalc(formula);

        this.logger.log(`testMemento(). Восстановление формулы.`);
        const back2 = this.setFormulaBack();
        this.logger.log(`testMemento(). Восстановленная формула и текущая - один объект is ${back2 == formula}`);
        logSixCalc(formula);
    }

    testObserver() {
        const randPublisher = new RandPublisher();
        const f1 = new FormulaSub(randPublisher, 'd20');
        const f2 = new FormulaSub(randPublisher, 'maxd20');
        const f3 = new FormulaSub(randPublisher, 'mind20');

        const logSixCalc = (formula: FormulaSub) => {
            const result = new Array<number>();
            for (let i = 0; i < 6; i++) {
                result.push(formula.calculate());
            }
            this.logger.log(`tesObserver(). Результаты шести бросков для ${formula.soursStr1} = ${result}`);
        }
        this.logger.log(`tesObserver(). Проверка работы формул:`);
        [f1, f2, f3].forEach(logSixCalc);

        this.logger.log(`tesObserver(). Изменение функции случайных чисел (обновление издателя). Теперь случайные числа будут вещественными и ограниченными от 5, до 15.`);
        randPublisher.setNewRandFunc((min: number, max: number, count: number) => {
            const result = new Array<number>();
            for(let i = 0; i < count; i++) {
                const num = Number((Math.random() * (max - min) + min).toFixed(2))
                result.push(num);
            }
            return result;
        })

        this.logger.log(`tesObserver(). Проверка работы формул:`);
        [f1, f2, f3].forEach(logSixCalc);

        this.logger.log(`tesObserver(). Изменение функции случайных чисел (обновление издателя). Теперь случайные числа будут ограниченными от 5, до 10.`);
        randPublisher.setNewRandFunc((min: number, max: number, count: number) => {
            
            min = Math.max(min, 5);
            max = Math.min(10, max);

            const result = new Array<number>();
            for(let i = 0; i < count; i++) {
                const num = Math.round(Math.random() * (max - min) + min)
                result.push(num);
            }
            return result;
        })

        this.logger.log(`tesObserver(). Проверка работы формул:`);
        [f1, f2, f3].forEach(logSixCalc);  
    }
}