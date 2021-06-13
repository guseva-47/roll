import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { TabletopDto } from './dto/tabletop.dto';
import { gameRole } from './enum/game-role.enum';
import { BadId } from './exseption/bad-id.exception';
import { TabletopNotFound } from './exseption/tabletop-undefind.exception';
import { ITabletop } from './interface/tabletop.interface';

@Injectable()
export class TabletopService {
    constructor(
        @InjectModel('Tabletop') private readonly tabletopModel: Model<ITabletop>,
    ) {}

    // создание новой игры, редактирование параметров существующей игры, передача прав на игру другому пользователю, удаление игры.

    async getAllTabletops(idUser: string): Promise<Array<ITabletop>> {
        const myTabletops = await this.getCreatedTabletops(idUser);
        const frendlyTabletops = await this.getFrendlyTabletops(idUser);
        return myTabletops.concat(frendlyTabletops);
    }

    async getTabletop(idUser: string, idTabletop: string): Promise<ITabletop> {
        const tabletop = await this._checkTable(idTabletop);

        return tabletop;
        // const owner = tabletop.owner + '';
        // const user = idUser + '';
        // if (owner === user || tabletop.players.find(player => player.user === idUser))
        //     return tabletop;

        // throw new ForbiddenException();
    }

    async getCreatedTabletops(idUser: string): Promise<Array<ITabletop>> {
        return this.tabletopModel.find({ owner: idUser });
    }

    async getFrendlyTabletops(idUser: string): Promise<Array<ITabletop>> {
        // TODO BAG вернее костыль
        const all = await this.tabletopModel.find();
        let tables = all.filter(table => {
            return idUser + '' != table.owner + '';
        });
        tables = tables.filter(table => {
            if (table.players.length < 1) return false;
            const player = table.players.find(player => player.user + '' == idUser);
            return typeof player != undefined;
        });

        return tables;
        return this.tabletopModel.find({
            players: { user: idUser, role: gameRole.player },
        });
    }

    async createTabletop(idUser: string, tabletop: TabletopDto): Promise<ITabletop> {
        tabletop.owner = idUser;
        const newTabletop = new this.tabletopModel(tabletop);
        return newTabletop.save();
    }

    async updateTabletop(tabletop: TabletopDto): Promise<ITabletop> {
        await this._checkTable(tabletop._id);

        const oldTable = await this.tabletopModel
            .findByIdAndUpdate(tabletop._id, tabletop)
            .orFail(new TabletopNotFound());
        return oldTable.execPopulate();
    }

    async removeTableTop(idUser: string, idTabletop: string): Promise<void> {
        const tabletop: ITabletop = await this._checkTable(idTabletop);
        const owner = tabletop.owner + '';
        const user = idUser + '';
        if (owner !== user) throw new ForbiddenException();

        tabletop.deleteOne();
    }

    async rightTransfer(tabletop: TabletopDto, idUserTo: string): Promise<ITabletop> {
        this._checkTable(tabletop._id);

        tabletop.owner = idUserTo;
        return this.updateTabletop(tabletop);
    }

    private async _checkTable(idTabletop: string): Promise<ITabletop> {
        if (!Types.ObjectId.isValid(idTabletop)) throw new BadId();

        const tabletop = await this.tabletopModel
            .findById(idTabletop)
            .orFail(new TabletopNotFound());
        return tabletop.execPopulate();
    }

    async removeAllTables() {
        await this.tabletopModel
            .find()
            .remove()
            .exec();
    }

    async joinUsers(idUsers: string[], idTabletop: string): Promise<ITabletop> {
        const tabletop = await this._checkTable(idTabletop);
        idUsers.forEach(idUser => {
            const alredyUser = tabletop.players.find(player => player.user == idUser);
            if (typeof alredyUser == 'undefined')
                tabletop.players.push({ role: gameRole.player, user: idUser });
        });

        return await tabletop.save();
    }
}
