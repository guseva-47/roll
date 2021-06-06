export interface IMessage extends Document {
    readonly _id: string;
    readonly text: string;
    readonly date: Date;
    readonly author: string;
    readonly tabletop: string;
}