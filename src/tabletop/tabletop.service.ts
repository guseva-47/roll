import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { TabletopDto } from './dto/tabletop.dto';
import { TabletopNotFound } from './exseption/tabletop-undefind.exception';
import { ITabletop } from './interface/tabletop.interface';

@Injectable()
export class TabletopService {
    constructor(
        @InjectModel('Tabletop') private readonly tabletopModel: Model<ITabletop>,
        ){}

    // создание новой игры, редактирование параметров существующей игры, передача прав на игру другому пользователю, удаление игры.

    async getAllTabletops(idUser: string): Promise<Array<ITabletop>> {
        
        const myTabletops = await this.getCreatedTabletops(idUser);
        const frendlyTabletops = await this.getFrendlyTabletops(idUser);

        return myTabletops.concat(frendlyTabletops)
    }

    async getTabletop(idUser: string, idTabletop: string): Promise<ITabletop> {
        
        
        const tabletop = await this._checkTable(idTabletop)

        const owner = tabletop.owner + ''
        const user = idUser + ''

        if (owner === user || tabletop.players.find(player => player.user === idUser))
            return tabletop;

        throw new ForbiddenException();
    }
    // todo нужен ли orFail() ??????
    async getCreatedTabletops(idUser: string): Promise<Array<ITabletop>> {

        return await this.tabletopModel.find({owner: idUser});
    }

    async getFrendlyTabletops(idUser: string):  Promise<Array<ITabletop>> {

        return await this.tabletopModel.find({user: idUser});
    }

    async createTabletop(idUser: string, tabletop: TabletopDto): Promise<ITabletop> {
        
        tabletop.owner = idUser;
        const newTabletop = new this.tabletopModel(tabletop);
        return await newTabletop.save();        
    }

    async updateTabletop(tabletop: TabletopDto): Promise<ITabletop> {

        return await (await this.tabletopModel
            .findByIdAndUpdate(tabletop._id, tabletop)
            .orFail(new TabletopNotFound))
            .execPopulate();
    }

    async removeTableTop(idUser: string, idTabletop: string): Promise<any> {
        
        const tabletop: ITabletop = await this._checkTable(idTabletop)
        const owner = tabletop.owner + ''
        const user = idUser + ''
        if (owner !== user) throw new ForbiddenException();
        
        return await this.tabletopModel.deleteOne(tabletop);
    }

    async rightTransfer(tabletop: TabletopDto, idUserTo: string): Promise<ITabletop> {
        
        tabletop.owner = idUserTo;
        return this.updateTabletop(tabletop);
    }

    async _checkTable(idTabletop: string) {
        const tabletop = await this.tabletopModel.findById(idTabletop).orFail(new TabletopNotFound)
        return await tabletop.execPopulate();
    } 

    async removeAllTables() {
        await this.tabletopModel.find().remove().exec();
    }
}
