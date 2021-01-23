import { ICompendium } from "./interface/compendium.interface";

export abstract class EditorCompendium {
    
    // editNote(): INote {
    // }
    
    abstract loadCompendium(): ICompendium;
}