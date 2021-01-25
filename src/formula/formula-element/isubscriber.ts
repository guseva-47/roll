import { RandPublisher } from "./randpublisher";

export interface ISubscriber {
    update(rp: RandPublisher);
}