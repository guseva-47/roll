import { IsNotEmpty } from "class-validator";

export class NoteDto {
    @IsNotEmpty()
    _id: string;
    
    @IsNotEmpty()
    recipient: string;
    
    @IsNotEmpty()
    sender: string;
    
    @IsNotEmpty()
    text: string;

    date: Date;

}