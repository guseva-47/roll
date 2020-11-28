import { roleEnum } from "src/user/enum/role.enum";

export interface IPlayer {
    readonly user: string;
    readonly role: roleEnum;
}