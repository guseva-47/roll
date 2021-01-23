import { IVisitor } from "../visitor/visitor.interface";

export interface ISheet {
    //tabletopID: string;
    getSkills();
    convert(v: IVisitor): string;
}