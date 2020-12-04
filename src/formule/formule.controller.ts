import { Controller, Get, Logger, LoggerService, Query,  } from '@nestjs/common';

import { FormuleService } from './formule.service';

@Controller('formule')
export class FormuleController {
    
    private readonly logger: LoggerService = new Logger(FormuleController.name);

    constructor(
        private formuleService: FormuleService,
    ){}

    @Get()
    getResult(@Query('formule') formule): number {

        this.logger.log(`getResult(). Запрос: вычислить результат формулы formule = ${formule}`);
        if (formule.lenght == 0) return 0;

        return this.formuleService.getResult(formule);
    }
}
