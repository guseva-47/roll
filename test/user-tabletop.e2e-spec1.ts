import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { configModule } from 'src/configure.root';
import { meUserTestData, otherUserTestData } from './data';
import { TabletopDto } from 'src/tabletop/dto/tabletop.dto';
import { ITabletop } from 'src/tabletop/interface/tabletop.interface';

process.setMaxListeners(100);

describe('User tabletop controller (e2e)', () => {
    let app: INestApplication;
    const me = meUserTestData;
    const otherUser = otherUserTestData;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [configModule, AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    describe('Important user-tabletop-controller functionality', () => {
        let createdTableId: string;
        const tableName = 'testing game';

        it('/:id/tabletops (GET) get all tabletop of me', async done => {
            await request(app.getHttpServer())
                .get('/' + me.id + '/tabletops')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(200);

            done();
        });

        it('/tabletops (POST) create tabletop', async done => {
            const tabletop = new TabletopDto();
            tabletop.name = tableName;

            await request(app.getHttpServer())
                .post('/tabletops')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send(tabletop)
                .set('Accept', 'application/json')
                .expect(201)
                .then(response => {
                    const tabletop: ITabletop = response.body;

                    if (tabletop.owner !== me.id) done.fail();
                    if (tabletop.name !== tableName) done.fail();

                    createdTableId = tabletop._id;
                });

            done();
        });

        it('/tabletops (POST) create tabletop with wrong data', async done => {
            const tabletop = new TabletopDto();
            tabletop.name = '';

            await request(app.getHttpServer())
                .post('/tabletops')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send(tabletop)
                .set('Accept', 'application/json')
                .expect(400);

            done();
        });

        it('/tabletops/:idTable (GET) get the tabletop', async done => {
            await request(app.getHttpServer())
                .get('/tabletops/' + createdTableId)
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(200)
                .then(response => {
                    const tabletop: ITabletop = response.body;
                    if (tabletop.owner !== me.id) done.fail();
                });

            done();
        });

        it('/tabletops/:idTable (GET) get the tabletop with wong user', async () => {
            await request(app.getHttpServer())
                .get('/tabletops/' + createdTableId)
                .set('Authorization', 'Bearer ' + otherUser.jwtToken)
                .expect(403);
        });

        it('/tabletops/edit (PUT) edit tabletop', async done => {
            const tabletop = await request(app.getHttpServer())
                .get('/tabletops/' + createdTableId)
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(200)
                .then(response => {
                    return response.body;
                });

            const newName = 'lala name';
            tabletop.name = newName;

            await request(app.getHttpServer())
                .put('/tabletops/edit')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send(tabletop)
                .set('Accept', 'application/json')
                .expect(200);

            await request(app.getHttpServer())
                .get('/tabletops/' + createdTableId)
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(200)
                .then(response => {
                    const table: ITabletop = response.body;
                    if (table.name !== newName) done.fail();
                });

            done();
        });

        it('/tabletops/edit (PUT) edit tabletop with wrong data', async done => {
            const tabletop = await request(app.getHttpServer())
                .get('/tabletops/' + createdTableId)
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(200)
                .then(response => {
                    return response.body;
                });
            tabletop.name = '';

            await request(app.getHttpServer())
                .put('/tabletops/edit')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send(tabletop)
                .set('Accept', 'application/json')
                .expect(400);

            done();
        });

        it('/tabletops/:idTable (DELETE) delete tabletop', async done => {
            await request(app.getHttpServer())
                .delete('/tabletops/' + createdTableId)
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(200)
                .then(async () => {
                    await request(app.getHttpServer())
                        .get('/tabletops/' + createdTableId)
                        .set('Authorization', 'Bearer ' + me.jwtToken)
                        .expect(404);
                });
            done();
        });

        // it('DELETE ALL TABLETOPS TODO', async () => {
        //     await request(app.getHttpServer())
        //         .delete('/delete_all_tables')
        //         .set('Authorization', 'Bearer ' + me.jwtToken)
        //         .expect(200)

        // })
    });

    afterAll(async () => {
        await app.close();
    });
});
