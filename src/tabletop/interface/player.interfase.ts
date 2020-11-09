import { roleEnum } from "src/user/enum/role.enum";

export interface IPlayer {
    user: string;
    role: roleEnum;
}