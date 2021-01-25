import { Formula } from "./formula";
import { RandPublisher } from "./randpublisher";
import { ISubscriber } from "./isubscriber"
import { Logger, LoggerService } from "@nestjs/common";

export class FormulaSub extends Formula implements ISubscriber {
    soursStr1: string;
    private readonly loggerSub: LoggerService = new Logger(FormulaSub.name);
    constructor(randome: RandPublisher, sourceStr: string) {
        super(randome, sourceStr);
        this.loggerSub.log('FormulaSub(). Создание формулы и подписка на обновления.');
        this.soursStr1 = sourceStr;
        randome.subscribe(this);
    }
    update(rp: RandPublisher) {
        this.loggerSub.log('update(). Обновление формулы.');
        this.setRandomiser(rp);
    }
}