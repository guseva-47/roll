// todo название FormulaStageIter заменить на типа этапы вычислений постфиксной нотации
export class FormulaStageIter implements IIterator {
    private current = 0;
    private stages = [];

    constructor(notation: string[]) {
        this.stages = this._stepByStep(notation);
    };

    getNext(): string {

        if (this.hasMore()){
            const tmp = this.stages[this.current];
            this.current++;
            return tmp;
        }
        return null;
    }

    hasMore(): boolean {
        return this.current < this.stages.length;
    }

    private _stepByStep(notation: string[]): string[] {
        const steps: string[] = [];

        const instractions: { [name: string]: (a: string, b: string) => string } = {
            '^': (a, b) => `${a}^${b}`,
            '*': (a, b) => `(${a} * ${b})`,
            '/': (a, b) => `(${a} / ${b})`,
            '+': (a, b) => `(${a} + ${b})`,
            '-': (a, b) => `(${a} - ${b})`
        };

        for (let i = 0; i < notation.length; ++i) {
            const instraction = instractions[notation[i]] // The priority of the operation
            if (instraction) {
                const a = notation[i - 2];
                const b = notation[i - 1];
                const c = instraction(a, b);

                steps.push(c);
                notation[i] = c;
                notation.splice(i = (i - 2), 2);
            }
        }

        return steps;
    };
}