import { Test, TestingModule } from '@nestjs/testing';
import { TabletopService } from './tabletop.service';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

// Почему-то важно, чтобы пути были относительными
import { TabletopSchema } from './schema/tabletop.schema'
import DbModule, { closeMongoConnection } from '../../test/db-test-module';
import { TabletopDto } from './dto/tabletop.dto';
import { ForbiddenException } from '@nestjs/common';
import { TabletopNotFound } from './exseption/tabletop-undefind.exception';

describe('TabletopService', () => {
    let tabletopService: TabletopService;
    let connection: Connection;

    const validUserId = '5fb164e5b304e646441ce2da';
    const validAnotherUserId = '5fb16501b304e646441ce2db'
    const validTabletopId = '6016fcb432d6b2452420898f';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                DbModule({
                    connectionName: (new Date().getTime() * Math.random()).toString(16)
                }),
                MongooseModule.forFeature([
                    { name: 'Tabletop', schema: TabletopSchema },
                ])
            ],
            providers: [TabletopService]
        }).compile();

        tabletopService = module.get<TabletopService>(TabletopService);
        connection = await module.get(getConnectionToken());
    });

    afterEach(async () => {
        await connection.close(/*force:*/ true);
        await closeMongoConnection();
    })

    it('should be defined', async () => {
        expect(tabletopService).toBeDefined();
    });

    it('get all tabletops', async() => {
        // todo посчитать сколько раз вызывается find
        await tabletopService.getAllTabletops(validUserId);
    });

    it('save valid tabletop', async(done) => {
        const tabletop = {
            name: 'nameOfTabletop',
        }
        await tabletopService.createTabletop(validUserId, tabletop as TabletopDto).
            then(respon => {
               
                if (respon.name !== 'nameOfTabletop') done.fail('respon.name !== nameOfTabletop');
                if ((respon.owner + '') !== validUserId) done.fail('respon.owner !== validUserId');
                done();
            });
    });

    it('get tabletop by id with invalid tabletopId, expect 403 error', async() => {
        await expect(tabletopService.getTabletop(validUserId, 'invalidTableId')).rejects.toThrowError('Invalid tabletop id');
    });

    it('get non-existent tabletop, expect 404 error', async() => {
        await expect(tabletopService.getTabletop(validUserId, validTabletopId)).rejects.toThrowError('Tabletop not found');
    });

    it('get tabletop', async (done) => {
        const createdTabletop = await createTabletop(validUserId, 'nameOfTabletop');
        await tabletopService.getTabletop(createdTabletop.owner, createdTabletop._id).
            then(respon => {                
                if (respon.name !== createdTabletop.name) done.fail('respon.name !== nameOfTabletop');
                if (respon.owner+'' !== createdTabletop.owner) done.fail('respon.owner !== owner');
                if (respon._id+'' !== createdTabletop._id) done.fail('respon._id !== _id');
            });

        done();
    })

    it('get tabletop of another user, expect 403 error', async (done) => {
        const createdTabletop = await createTabletop(validUserId, 'nameOfTabletop');

        await expect(tabletopService.getTabletop(validAnotherUserId, createdTabletop._id)).rejects.toThrowError(ForbiddenException);        

        done();
    })

    it('update tabletop', async (done) => {
        const createdTabletop = await createTabletop(validUserId, 'nameOfTabletop');

        createdTabletop.name = 'Brand new name';
        await tabletopService.updateTabletop(createdTabletop as TabletopDto);

        await tabletopService.getTabletop(createdTabletop.owner, createdTabletop._id).
            then(respon => {                
                if (respon.name !== createdTabletop.name) done.fail('respon.name !== nameOfTabletop');
                if (respon.owner+'' !== createdTabletop.owner) done.fail('respon.owner !== owner');
                if (respon._id+'' !== createdTabletop._id) done.fail('respon._id !== _id');
            });

        done();
    })

    it('update tabletop with wrong tabletopId, expected 404 error', async (done) => {
        const createdTabletop = await createTabletop(validUserId, 'nameOfTabletop');
        
        createdTabletop._id = 'Brand new Id';
        await expect(tabletopService.updateTabletop(createdTabletop as TabletopDto)).rejects.toThrowError(TabletopNotFound);
        done();
    })

    it('delete tabletop',  async (done) => {
        const createdTabletop = await createTabletop(validUserId, 'nameOfTabletop');
        
        await tabletopService.removeTableTop(createdTabletop.owner, createdTabletop._id).
            then(respon => {
                if (respon.deletedCount != 1) done.fail();
                if (respon.n != 1) done.fail();
                if (respon.ok != 1) done.fail();
            })
        await expect(tabletopService.getTabletop(createdTabletop.owner, createdTabletop._id)).rejects.toThrowError('Tabletop not found');

        done();
    })

    it('delete someone else\'s tableб expect 403 error',  async () => {
        const createdTabletop = await createTabletop(validUserId, 'nameOfTabletop');
        
        await expect(tabletopService.removeTableTop(validAnotherUserId, createdTabletop._id)).rejects.toThrowError(ForbiddenException);
    })

    it('right transfer',  async () => {
        const createdTabletop = await createTabletop(validUserId, 'nameOfTabletop');
        
        await tabletopService.rightTransfer(createdTabletop as TabletopDto, validAnotherUserId);
        await expect(tabletopService.removeTableTop(validUserId, createdTabletop._id)).rejects.toThrowError(ForbiddenException);
    })

    async function createTabletop(ownerUserId: string, tabletopName: string) {
        const newTabletop = {
            name: tabletopName,
        }

        const createdTabletop = {
            name: '',
            owner: '',
            _id: '',
        }
        await tabletopService.createTabletop(ownerUserId, newTabletop as TabletopDto).
            then(respon => {
                createdTabletop.name = respon.name
                createdTabletop.owner = respon.owner + '';
                createdTabletop._id = respon._id + '';
            });
        
        return createdTabletop;
    }

    


})