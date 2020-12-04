import { Injectable, Logger, LoggerService } from "@nestjs/common";
import * as random from 'random';

@Injectable()
export class RandomeAdapter implements IRand{
    private rand;
    private readonly logger: LoggerService = new Logger(RandomeAdapter.name);

    constructor(seed: string) {
        this.rand = random.clone(seed);
    }

    sowing(seed: string) {
        this.logger.log('sowing(). Обновление генератора новым зерном.')
        
        this.rand = random.clone(seed);
        return this;
    }

    getNums(min: number, max: number, count = 1): number[] {
        const result: number[] = new Array<number>();
        for (let i = 0; i < count; i++) {
            const num: number = this.rand.int(min, max);
            result.push(num);
        }
        this.logger.log(`getNums(). Возвращение случайных чисел. [${result}]`);
        return result;
    }
}