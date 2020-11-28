import { Controller, Get, Request, Response, UseGuards, LoggerService, Logger, Query,} from '@nestjs/common';

import { JwtAuthGuard } from './auth/guard/jwt-auth.guard';
import { TrueRandomeService } from './true-randome/true-randome.service';

// todo поставиьт точки с запятыми

@Controller()
export class AppController {
    private readonly logger: LoggerService = new Logger(AppController.name)

    constructor(
        private trueRandomeService: TrueRandomeService
    ) {}

    @Get('rand')
    async getRandom(@Query() params: {count: string, min: string, max: string}) {
        this.logger.log('getRandom() get запрос на случайные числа.')

        const result = this.trueRandomeService.getNum(Number(params.count), Number(params.min), Number(params.max));
        this.logger.log(`getRandom() возвращение результата ${result.toString()}.`)
        return result;
    }

    @Get()
    getHello(): string {
        this.logger.log('hello - /')
        return 'hello';
    }

    @Get('login')
    getLogin(@Response() res) {
        res.redirect('/auth/google');
    }

    @Get('fail')
    getFail() {
        return 'не удалось авторизироваться(';
    }

    @Get('ok')
    @UseGuards(JwtAuthGuard)
    getOk(@Request() req) {
        return req.user;
    }
    
}
