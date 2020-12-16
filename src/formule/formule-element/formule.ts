import { Injectable, Logger, LoggerService } from "@nestjs/common";

import { Adventage } from "./adventage";
import { Constant } from "./constant";
import { Dice } from "./dice";
import { Disadventage } from "./disadventage";
import { Div } from "./div";
import { FewDices } from "./few-dices.class";
import { FormuleStageIter } from "./iterator/formule-stage.iterator";
import { Mult } from "./mult";
import { Pow } from "./pow";
import { Sub } from "./sub";
import { Sum } from "./sum";

@Injectable()
export class Formule implements IIterable {

    private sourceStr: string;
    private postfixNotation: Array<string>;
    private formulComposite: IValue;

    private readonly randome: IRand;

    private readonly logger: LoggerService = new Logger(Formule.name);

    constructor(randome: IRand, sourceStr: string, prototypeData?: {
        postfixNotation: Array<string>,
        formulComposite: IValue,
    }) {
        this.randome = randome;
        this.sourceStr = sourceStr;

        if (prototypeData) {
            this.postfixNotation = prototypeData.postfixNotation.slice();
            this.formulComposite = prototypeData.formulComposite.clone();
        }
        else {
            const expr = this._stringToExpr(this.sourceStr);
            this.postfixNotation = this._convert(expr);
            this.formulComposite = this._createFormula(this.postfixNotation);
        }
    }

    calculate(): number {
        this.logger.log('calc(). Вычисление формулы. (Запуск вычисления композиции).');
        return this.formulComposite.calc();
    }

    
    private _stringToExpr(str: string): string[] {
        this.logger.log(`_stringToExpr(). Преобразование строки str = ${str} в массив токенов.`);
        const regex = /([\s\-+*/\(\)])/  // divide by spaces, '-', '+', '*', '/', '(' and ')'.
        return str.split(regex).filter(s => s && s.trim().length > 0);
    }

    private _convert(expression: string[]): string[] {
        this.logger.log("_convert(). Преобразование в польскую инверсную запись.");

        const priorityMap: { [name: string]: number } = {
            "^": 4,
            "*": 3, "/": 3,
            "+": 2, "-": 2,
            "(": 1
        };

        function last<T>(array: T[]): T {
            return array[array.length - 1];
        }

        const stack: string[] = []; // contains operators
        const result: string[] = []; // contains expression-array in postfix notation

        for (const lexeme of expression) {
            if (lexeme === "(") {
                stack.push(lexeme);

            } else if (lexeme === ")") {
                while (true) {
                    const poped = stack.pop();
                    if (poped === "(") {
                        break;
                    }
                    result.push(poped);
                }

            } else {
                const priority = priorityMap[lexeme]; // The priority of the operation
                if (priority > 0) {  // An expression
                    while (stack.length > 0 && (priorityMap[last(stack)] >= priority && lexeme !== "^")) {
                        result.push(stack.pop());
                    }
                    stack.push(lexeme);

                } else {  // A number
                    result.push(lexeme);
                }
            }
        }
        const notation = result.concat(stack.reverse());

        this.logger.log(`_convert(). Результат преобразованя: [${notation}]`);

        return notation;
    }


    private _isInstruction (substring: string): boolean {
        const ch = substring[0];
        if (['^', '*', '/', '+', '-'].includes(ch)) return true;
        return false;
    }
    private _transform(substr: any): IValue {

        if (typeof(substr) != 'string') return substr;

        if (substr.includes('d'))
            return this._diceTransform(substr);
        
        return new Constant(Number(substr));
    }
    private _diceTransform(substr: string): IValue {
        
        let result: IValue;
        let maxmin = '';
        if (substr.includes('max') || substr.includes('min')){

            maxmin = substr.slice(0, 3);
            substr = substr.slice(3);
        }

        const indx = substr.indexOf('d');

        const diceSize = Number(substr.slice(indx + 1));
        result = new Dice(diceSize, this.randome);

        if (indx != 0) {
            const count = Number(substr.slice(0, indx));
            if (count > 1) 
                result = new FewDices(result, count);
        };

        if (maxmin == 'max') result = new Adventage(result);
        if (maxmin == 'min') result = new Disadventage(result);

        return result;
    }

    private _createFormula(notation: string[]): IValue | undefined {
        this.logger.log(`_createFormula(). Исходные данные: ${notation}.`);
        
        const newNotation: any[] = notation.slice();

        const instractions: { [name: string]: (list: IValue[]) => IValue } = {
            '^': (list: IValue[]) => new Pow(list),
            '*': (list: IValue[]) => new Mult(list),
            '/': (list: IValue[]) => new Div(list),
            '+': (list: IValue[]) => new Sum(list),
            '-': (list: IValue[]) => new Sub(list),
        };
        
        if (newNotation.length == 1)
            return this._transform(newNotation[0]);

        for (let i = 0; i < newNotation.length; ++i) {
            this.logger.log(`_createFormula(). Обработка ${newNotation[i]}.`);

            if (this._isInstruction(newNotation[i])) {

                const ab = [newNotation[i-2], newNotation[i-1]];
                const list = ab.map(str => this._transform(str));
                newNotation[i] = instractions[newNotation[i]](list);
                i -= 2;
                newNotation.splice(i, 2);
            }
        }

        return (newNotation.length === 1 ? newNotation[0] : undefined);
    };

    getIterator(): IIterator {
        return new FormuleStageIter(this.postfixNotation);
    }

    clone(): Formule {
        this.logger.log('clone()');
        return new Formule(this.randome, this.sourceStr, {
            postfixNotation: this.postfixNotation,
            formulComposite: this.formulComposite,
        })
    }
}
