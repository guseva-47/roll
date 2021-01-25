import { Controller, Get, Logger, LoggerService, Query,  } from '@nestjs/common';

import { FormulaService } from './formula.service';

@Controller('formula')
export class FormulaController {
    
    private readonly logger: LoggerService = new Logger(FormulaController.name);

    constructor(
        private formulaService: FormulaService,
    ){}

    @Get()
    getResult(@Query('formula') formula): number {

        this.logger.log(`getResult(). Запрос: вычислить результат формулы formula = ${formula}`);
        if (formula.lenght == 0) return 0;

        return this.formulaService.getResult(formula);
    }

    @Get('test-memento')
    getTestMemento(@Query('formula') formula) {

        this.logger.log(`getTestMemento(). Запрос: тест паттерна Снимок. formula = ${formula}`);
        if (formula.lenght == 0) return 0;

        return this.formulaService.testMemento(formula, 1);
    }

    @Get('test-observer')
    getTestObserver() {

        this.logger.log(`getTestObserver(). Запрос: тест паттерна Слушатель.`);

        return this.formulaService.testObserver();
    }
}
