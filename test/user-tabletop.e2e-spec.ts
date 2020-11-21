import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { configModule } from 'src/configure.root';
import { UserDto } from 'src/user/dto/user.dto';
import { profilePrivatType } from 'src/user/enum/profile-privet-type.enum';
import { meUserTestData, otherUserTestData } from './data';
import { TabletopDto } from 'src/tabletop/dto/tabletop.dto';
import {ITabletop} from 'src/tabletop/interface/tabletop.interface';

process.setMaxListeners(100);

describe('AppController (e2e)', () => {
    let app: INestApplication;
    const me = meUserTestData;
    const otherUser = otherUserTestData;

    const nonExistenId = '5fae59d7c4a4f05a98e23377'
    
    async function _editProfile(userDto: UserDto, userId: string, jwtToken: string): Promise<request.Response> {
        return await request(app.getHttpServer())
            .put('/' + userId)
            .set('Authorization', 'Bearer ' + jwtToken)
            .send(userDto)
            .set('Accept', 'application/json')
            .expect(200)
    }

    async function _getProfile(userId: string, jwtToken: string): Promise<request.Response> {
        return await request(app.getHttpServer())
            .get('/' + userId)
            .set('Authorization', 'Bearer ' + jwtToken)
            .expect(200)
    }

    function _deepCopyUser(user) {
        const newUser = {...user}
        newUser.roles = user.roles.slice()
        newUser.subscribers = user.subscribers.slice()
        newUser.subscriptions = user.subscriptions.slice()
        newUser.subscrReqsToMe = user.subscrReqsToMe.slice()
        newUser.subscrReqsFromMe = user.subscrReqsFromMe.slice()
        newUser.ignoreUsers = user.ignoreUsers.slice()
        
        return newUser
    }

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [configModule, AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    // todo
    describe('', async () => {
        let createdTableId;
        const tableName = 'testing game'
        
        it('/tabletops (POST) create tabletop', async (done) => {

            const tabletop = new TabletopDto()
            tabletop.name = tableName
            //tabletop.owner = userOld._id

            await request(app.getHttpServer())
                .post('/tabletops')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send(tabletop)
                .set('Accept', 'application/json')
                .expect(201)
                .then(response => {
                    const tabletop: ITabletop = response.body
                    
                    console.log(tabletop._id)
                    
                    if (tabletop.owner !== me.id) done.fail()
                    if (tabletop.name !== tableName) done.fail()

                    createdTableId = tabletop._id
                })

            done();
        })

        it('/tabletops (POST) create tabletop with wrong data', async (done) => {

            const tabletop = new TabletopDto()
            tabletop.name = ''

            await request(app.getHttpServer())
                .post('/tabletops')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send(tabletop)
                .set('Accept', 'application/json')
                .expect(400)

            done();
        })

        it('/tabletops/:idTable (GET) create tabletop', async (done) => {
            
            await request(app.getHttpServer())
                .get('/tabletops')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(200)
                .then(response => {
                    const tabletops: ITabletop = response.body
                    
                    console.log(tabletops)
                    
                    // if (tabletops[0].owner !== me.id) done.fail()
                    // if (tabletops[0].name !== tableName) done.fail()
                })

            done();
        })
        
        it('/tabletops/edit (PUT) edit tabletop', async (done) => {

            // const tabletop = new TabletopDto()
            // tabletop.name = ''

            // await request(app.getHttpServer())
            //     .put('/tabletops/edit')
            //     .set('Authorization', 'Bearer ' + me.jwtToken)
            //     .send(tabletop)
            //     .set('Accept', 'application/json')
            //     .expect(400)

            // done();
        })
        
        it('/tabletops/edit (PUT) edit tabletop with wrong data', async (done) => {

            // const tabletop = new TabletopDto()
            // tabletop.name = ''

            // await request(app.getHttpServer())
            //     .put('/tabletops/edit')
            //     .set('Authorization', 'Bearer ' + me.jwtToken)
            //     .send(tabletop)
            //     .set('Accept', 'application/json')
            //     .expect(400)

            // done();
        })

        it('/tabletops/:idTable (DELETE) delete tabletop', async (done) => {
            
            await request(app.getHttpServer())
                .post('/tabletops/' + createdTableId)
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(200)
                .then(response => {
                    const tabletop: ITabletop = response.body

                    if (tabletop.owner !== me.id) done.fail()
                    if (tabletop.name !== tableName) done.fail()
                })
        })

        it('/:id/tabletops (GET) get all tabletop of me', async (done) => {
            
            await request(app.getHttpServer())
                .get('/' + me.id + '/tabletops')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(200)
                .then(response => {
                    const tabletops: ITabletop = response.body
                    
                    console.log(tabletops)
                    
                    // if (tabletops[0].owner !== me.id) done.fail()
                    // if (tabletops[0].name !== tableName) done.fail()
                })

            done();
        })
        
    });

    afterAll(async () => {
        await app.close();
    });
});
