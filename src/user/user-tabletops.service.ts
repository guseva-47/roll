import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';

import { TabletopDto } from '../tabletop/dto/tabletop.dto';
import { ITabletop } from '../tabletop/interface/tabletop.interface';
import { TabletopService } from '../tabletop/tabletop.service';
import { profilePrivatType } from './enum/profile-privet-type.enum';
import { IUser } from './interface/user.interface';
import { UserService } from './user.service';

@Injectable()
export class UserTabletopsService {
    constructor(
        private tabletopService: TabletopService,
        private userService: UserService,
    ) {}

    async getAllTabletops(idMe: string, idSomeUser?: string): Promise<Array<ITabletop>> {
        if (!idSomeUser || idMe === idSomeUser)
            return this.tabletopService.getAllTabletops(idMe);

        const userOther: IUser = await this.userService.getUser(idMe, idSomeUser);
        if (
            userOther.profilePrivatType === profilePrivatType.closed &&
            !userOther.subscribers.includes(idMe)
        )
            throw new ForbiddenException();

        return this.tabletopService.getAllTabletops(userOther._id);
    }

    async getTabletop(idMe: string, idTabletop: string): Promise<ITabletop> {
        const owner = (await this.tabletopService.getTabletop(idMe, idTabletop)).owner;
        if (owner + '' == idMe) return this.tabletopService.getTabletop(idMe, idTabletop);
        if (!this.userService.isOpenProfileTo(owner, idMe))
            throw new ForbiddenException();

        return this.tabletopService.getTabletop(idMe, idTabletop);
    }

    async editTabletop(idMe: string, tabletop: TabletopDto): Promise<ITabletop> {
        if (tabletop.owner !== idMe) throw new ForbiddenException();
        if (tabletop.name == '') throw new BadRequestException();
        return await this.tabletopService.updateTabletop(tabletop);
    }

    async removeTabletop(idMe: string, idTabletop: string): Promise<any> {
        return await this.tabletopService.removeTableTop(idMe, idTabletop);
    }

    async removeAllTables() {
        return await this.tabletopService.removeAllTables();
    }

    async createTabletop(idMe: string, tabletop: TabletopDto): Promise<ITabletop> {
        if (tabletop.name == '') throw new BadRequestException();
        return await this.tabletopService.createTabletop(idMe, tabletop);
    }

    async isUserRelateToTable(idUser: string, idTable: string): Promise<boolean> {
        const allTables = await this.tabletopService.getAllTabletops(idUser);
        const i = allTables.findIndex(table => {
            table._id + '' == idTable;
        });
        return i != -1;
    }

    async joinUsers(
        idMe: string,
        usersToJoin: string[],
        idTabletop: string,
    ): Promise<ITabletop> {
        // имею ли я права добавлять пользователей
        const table = await this.tabletopService.getTabletop(idMe, idTabletop);
        const owner = table.owner;
        if (owner + '' !== idMe) {
            if (!this.userService.isOpenProfileTo(owner, idMe))
                throw new ForbiddenException();
        }

        // составить список пользователей, которые имеют право присоединяться к столу
        const approvedUsers = usersToJoin.filter(
            async idUser => await this.userService.isOpenProfileTo(owner, idUser),
        );

        if(approvedUsers.length < 1) return table;

        return this.tabletopService.joinUsers(approvedUsers, idTabletop);
    }
}
