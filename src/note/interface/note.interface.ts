export interface INote  extends Document {
    // добавить статус сообщения прочитан или нет, мб тип сообщения "оповещение от системы", "заявка в друзья"
    readonly recipient: string;
    readonly sender: string;
    readonly text: string;
    readonly date: Date;
}
