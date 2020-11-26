import { HttpService, Injectable, Logger, LoggerService } from '@nestjs/common';
import * as random from 'random';

import { ServiceUnavailable } from './exception/servise-unavailable.exception';


@Injectable()
export class TrueRandomeService {

    private readonly seedsStorage: Array<string> = new Array<string>(); // список случайных чисел
    private readonly spareSeed = process.env.SEED_FOR_RANDOMIZER;

    private countOfUsed = 0; // солько раз использовали генератор с момента последнего засева
    private readonly maxCountOfUsed = 10; // максимальное количсетво раз, сколько можно использовать генератор с момента последнего засева

    private readonly isActive = false;
    private readonly queryConsts = {
        num: 3, // количество строк, запрашиваемое у сервиса randoom.org
        len: 2,
        digits: 'on',
        upperalpha: 'on',
        loweralpha: 'on',
        unique: 'off',
        format: 'plain',
        rnd: 'new',
    }

    private rand; // генератор случайных чисел

    private readonly logger: LoggerService = new Logger(TrueRandomeService.name)


    constructor(private httpService: HttpService) {
        // todo
        this.logger.log('Конструктор. Инициализация генератора стандартным зерном.')
        // засеять генератор чем-то посредственным
        this.rand = random.clone(this.spareSeed)
        // асинхронное засеивание генератора
        this._sowing()
    }

    private async _addTrueRandomeNums(): Promise<any> {
        
        this.logger.log('_addTrueRandomeNums(). Запрос к сервису random.org для получения истинно случайных строк .')
        if (!this.isActive) this.seedsStorage.push(this.spareSeed);
        
        // https://www.random.org/strings/?num=10&len=8&digits=on&upperalpha=on&loweralpha=on&unique=on&format=html&rnd=new
        return await this.httpService.get('https://www.random.org/strings/', {
            params: {
                num: this.queryConsts.num,
                len: this.queryConsts.len,
                digits: this.queryConsts.digits,
                upperalpha: this.queryConsts.upperalpha,
                loweralpha: this.queryConsts.loweralpha,
                unique: this.queryConsts.unique,
                format: this.queryConsts.format,
                rnd: this.queryConsts.rnd,
            }
        })
            .toPromise()
            .then(response => {
                if (response.status == 502){
                    this.logger.error('_addTrueRandomeNums(). Сервис недоступен!');

                    throw new ServiceUnavailable();
                }
                if (response.status == 200) {
                    this.logger.log('_addTrueRandomeNums(). Ответ принят успешно.');

                    const seeds = response.data.split('\n').filter(current => current !== '');
                    
                    this.logger.log(`Хранилище до добавления в него новых строк : [${this.seedsStorage.toString()}]`)

                    this.seedsStorage.concat(seeds);

                    seeds.forEach(curr => this.seedsStorage.push(curr))

                    this.logger.log(`Хранилище после добавления в него новых строк : [${this.seedsStorage.toString()}]`)
                }
            })
            .catch(err => {
                if (err !== ServiceUnavailable){ 
                    this.logger.error(err);

                    throw err;
                }
                this.seedsStorage.push(this.spareSeed);

                this.logger.log('_addTrueRandomeNums(). Сервис недоступен. Будет использовано запасное зерно.');
            });
    }

    private async _sowing(): Promise<any> {
        this.logger.log('_sowing(). Метод засеивания генератора случайных чисел.')

        if (this.seedsStorage.length <= 0) {
            this.logger.log('_sowing(). Хранилище истинно случайных строк пусто.')
            // нужно дополнить генератор
            await this._addTrueRandomeNums()
        }

        const newSeed = this.seedsStorage.pop();
        
        // засеивание генератора
        this.rand = random.clone(newSeed)
        this.logger.log('_sowing(). Генератор успешно проинициализирован.')

        this.countOfUsed = 0;
    }

    getNum(count = 1, min = 1, max = 20): Array<number> {

        this.logger.log(`getNum(). Получение случайных чисел в количестве ${count}, из диапазона [${min} ; ${max}].`);

        if (count <= 0 || min >= max) {
            this.logger.error(`getNum(). ${count} <= 0 || ${min} >= ${max}`)
            
            throw new Error(`${count} <= 0 || ${min} >= ${max}`);
        }
        
        this.countOfUsed += count;

        const result: number[] = new Array<number>();
        for (let i = 0; i < count; i++) {
            const num: number = this.rand.int(min, max);
            result.push(num);
        }
        
        if (this.countOfUsed >= this.maxCountOfUsed){
            this.logger.log(`getNum(). Количество запрошенных случайных чисел привысило лимит. Нужно обновить генератор новым зерном.`);

            this._sowing();
        }
        
        return result;        
    }
}
