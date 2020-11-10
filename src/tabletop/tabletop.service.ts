import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserDto } from 'src/user/dto/user.dto';
import { roleEnum } from 'src/user/enum/role.enum';
import { TabletopDto } from './dto/tabletop.dto';
import { gameRole } from './enum/game-role.enum';
import { TabletopNotFound } from './exseption/tabletop-undefind.exception';
import { ITabletop } from './interface/tabletop.interface';

@Injectable()
export class TabletopService {
    constructor(@InjectModel('Tabletop') private readonly tabletopModel: Model<ITabletop>){}

    // создание новой игры, редактирование параметров существующей игры, передача прав на игру другому пользователю, удаление игры.

    async getAllTabletops(idUser: string): Promise<Array<ITabletop>> {
        
        const myTabletops = await this.getCreatedTabletops(idUser);
        const frendlyTabletops = await this.getFrendlyTabletops(idUser);

        return myTabletops.concat(frendlyTabletops)
    }

    async getTabletop(idUser: string, idTabletop: string): Promise<ITabletop> {
        
        const table = await this.tabletopModel.findById(idTabletop)
        if (table.owner === idUser || table.players.find(player => player.user === idUser))
            return table;

        throw new ForbiddenException();
    }

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

        return await (await this.tabletopModel.findByIdAndUpdate(tabletop._id, tabletop)).execPopulate();
    }

    async removeTableTop(idUser: string, idTabletop: string): Promise<ITabletop> {
        
        const tabletop = await (await this.tabletopModel.findById(idTabletop)).execPopulate();
        if (tabletop.owner !== idUser) throw new ForbiddenException();
        
        return await (await this.tabletopModel.findByIdAndRemove(idTabletop)).execPopulate();
    }

    async rightTransfer(tabletop: TabletopDto, idUserTo: string): Promise<ITabletop> {
        
        tabletop.owner = idUserTo;
        return this.updateTabletop(tabletop);
    }
}