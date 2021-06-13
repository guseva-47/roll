import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';

import { TabletopDto } from 'src/tabletop/dto/tabletop.dto';
import { ITabletop } from 'src/tabletop/interface/tabletop.interface';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UserTabletopsService } from './user-tabletops.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class UserTabletopsController {
    constructor(private userTabletopsService: UserTabletopsService) {}

    // @Get(':id/tabletops')
    // async getAllTabletops(@Param('id') idSomeUser: string, @Request() req) {
    //     const idMe = req.user.id;
    //     if (idMe === idSomeUser)
    //         return await this.userTabletopsService.getAllTabletops(idMe);

    //     return await this.userTabletopsService.getAllTabletops(idMe, idSomeUser);
    // }
    @Get(':id/tabletops')
    async getLastTabletops(
        @Param('id') idSomeUser: string,
        @Request() req,
        @Query() count?: number,
    ): Promise<ITabletop[]> {
        const idMe = req.user.id;
        let tables: ITabletop[] = [];
        if (idMe === idSomeUser)
            tables = await this.userTabletopsService.getAllTabletops(idMe);
        else tables = await this.userTabletopsService.getAllTabletops(idMe, idSomeUser);

        count = count < tables.length ? count : tables.length;
        return tables.slice(0, count);
    }

    @Get('tabletops/:idTable')
    async getTabletop(
        @Param('idTable') idTable: string,
        @Request() req,
    ): Promise<ITabletop> {
        const idMe = req.user.id;
        return await this.userTabletopsService.getTabletop(idMe, idTable);
    }

    @Put('tabletops/edit')
    async editTabletop(
        @Body() tabletopDto: TabletopDto,
        @Request() req,
    ): Promise<ITabletop> {
        const idMe = req.user.id;
        return await this.userTabletopsService.editTabletop(idMe, tabletopDto);
    }

    @Delete('tabletops/:idTable')
    async deleteTabletop(
        @Param('idTable') idTable: string,
        @Request() req,
    ): Promise<ITabletop> {
        const idMe = req.user.id;
        return await this.userTabletopsService.removeTabletop(idMe, idTable);
    }

    @Post('tabletops')
    async createTabletop(
        @Body() tabletopDto: TabletopDto,
        @Request() req,
    ): Promise<ITabletop> {
        const idMe = req.user.id;
        return await this.userTabletopsService.createTabletop(idMe, tabletopDto);
    }

    @Post('tabletops/:idTable/join')
    async joinToTable(
        @Param('idTable') idTable: string,
        @Body() users: string[],
        @Request() req,
    ): Promise<ITabletop> {
        const idMe = req.user.id;
        return await this.userTabletopsService.joinUsers(idMe, users, idTable);
    }

    // @Delete('delete_all_tables')
    // async deleteAllTabletop(): Promise<void>
    // {
    //     return await this.userTabletopsService.removeAllTables();
    // }
}
