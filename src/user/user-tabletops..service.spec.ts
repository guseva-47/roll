import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TabletopDto } from 'src/tabletop/dto/tabletop.dto';
import { ITabletop } from 'src/tabletop/interface/tabletop.interface';
import { TabletopService } from '../tabletop/tabletop.service';
import { profilePrivatType } from './enum/profile-privet-type.enum';
import { IUser } from './interface/user.interface';
import { UserTabletopsService } from './user-tabletops.service';
import { UserService } from './user.service';

class UserServiceMock {
    repo = [
        {
            _id: 'openId',
            profilePrivatType: profilePrivatType.open,
        }
        ,
        {
            _id: 'closedId',
            profilePrivatType: profilePrivatType.closed,
        }
    ]

    async getUser(idMe: string, idOther ?: string): Promise<IUser> {
        if (!idOther)
            return this.repo.find(item => item._id == idMe) as IUser;
        return this.repo.find(item => item._id == idOther) as IUser;
    }
}

class TabletopServiceMock {
    private repo = [];
    createTabletop(idUser: string, tabletop: TabletopDto): ITabletop {
        
        tabletop.owner = idUser;
        tabletop._id = (new Date().getTime() * Math.random()).toString(16);
        this.repo.push(tabletop);
        return tabletop as ITabletop;     
    }
    getAllTabletops(idUser: string) {
        return this.repo.filter(table => table.owner == idUser+'');
    }
    updateTabletop(tabletop: TabletopDto) {
        return tabletop as ITabletop;
    }
}

describe('TabletopService', () => {
    let userTabletopsService: UserTabletopsService;

    const openUserId = 'openId';
    const closedUserId = 'closedId'

    beforeEach(async () => {
        const UserServiceProvider = {
            provide: UserService,
            useClass: UserServiceMock,
        };

        const TabletopServiceProvider = {
            provide: TabletopService,
            useClass: TabletopServiceMock,
        };

        const moduleRef = await Test.createTestingModule({
            providers: [UserTabletopsService, UserServiceProvider, TabletopServiceProvider],
          }).compile();

        userTabletopsService = moduleRef.get<UserTabletopsService>(UserTabletopsService);
    });

    it('should be defined', async () => {
        expect(userTabletopsService).toBeDefined();
    });

    it('get all tabletops of me', async () => {
        expect(userTabletopsService.getAllTabletops(openUserId)).toBeDefined();
    });

    it('get all tabletops of other user with open profile', async () => {
        expect(userTabletopsService.getAllTabletops(closedUserId, openUserId)).toBeDefined();
    });

    it('get all tabletops of other user with closed profile, expect 403 error', async () => {
        expect(userTabletopsService.getAllTabletops(closedUserId, openUserId)).rejects.toThrowError(ForbiddenException)
    });

    it('update tabletop of other user, expected 403 error', async () => {
        const tabletopDto = {
            owner: closedUserId,
            name: 'some name',
        }
        expect(userTabletopsService.editTabletop(openUserId, tabletopDto as TabletopDto)).rejects.toThrowError(ForbiddenException)
    });

    it('update tabletop with wrong data, expected 400 error', async () => {
        const tabletopDto = {
            owner: openUserId,
        }
        expect(userTabletopsService.editTabletop(openUserId, tabletopDto as TabletopDto)).rejects.toThrowError(ForbiddenException)
    });

    it('create tabletop with wrong data, expected 400 error', async () => {
        expect(userTabletopsService.createTabletop(openUserId, {} as TabletopDto)).rejects.toThrowError(ForbiddenException)
    });



    
})