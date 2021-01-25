import { Logger, LoggerService } from "@nestjs/common";
import { ISubscriber } from "./isubscriber";

export class RandPublisher implements IRand {
    private subscribers = new Array<ISubscriber>();
    private readonly logger: LoggerService = new Logger(RandPublisher.name);

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    sowing() {}

    private rand = (min: number, max: number, count: number) => {
        const result = new Array<number>();
        for(let i = 0; i < count; i++)
            result.push(Math.round(Math.random() * (max - min) + min));
        return result;
    }

    getNums(min: number, max: number, count: number): number[] {
        this.logger.log(`getNums(). Получение случайных чисел.`);
        return this.rand(min, max, count);
    }

    setNewRandFunc(newFunc) {
        this.logger.log(`setNewRandFunc(). Изменение рандомайзера.`);
        this.rand = newFunc;
        this.notifySubscribers();
    }
    
    subscribe(f: ISubscriber) {
        this.logger.log(`subscribe(). Подписка на обновление рандомайзера.`);
        if (!this.subscribers.includes(f))
                this.subscribers.push(f);
    }
    unsubscribe(f: ISubscriber) {
        this.logger.log(`unsubscribe(). Отписка от обновлений рандомайзера.`);
        if (this.subscribers.includes(f))
            this.subscribers = this.subscribers.splice(this.subscribers.indexOf(f), 1);
    }
    notifySubscribers() {
        this.logger.log(`notifySubscribers(). Оповещение слушателей об изменении.`);
        this.subscribers.forEach((formula: ISubscriber) => {
            formula.update(this);
        })
    }
}