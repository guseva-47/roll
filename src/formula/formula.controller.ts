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
        
        if (formula.length == 0) return 0;

        return this.formulaService.getResult(formula);
    }

}
