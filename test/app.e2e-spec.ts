import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { assert } from 'console';

import { AppModule } from './../src/app.module';
import { configModule } from 'src/configure.root';
import { UserDto } from 'src/user/dto/user.dto';
import passport from 'passport';
import { response } from 'express';

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [configModule, AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    describe('simplest test for test', () => {
        it('/ (GET)', async () => {
            await request(app.getHttpServer())
                .get('/')
                .expect(200)
                .expect('hello');
        });
    });

    describe('redirecting to google for login', () => {

        it('/login (GET)', async () => {
            await request(app.getHttpServer())
                .get('/login')
                .expect(302)
                .expect('location', '/auth/google')
        });

        it('/auth/google (GET)', async () => {
            await request(app.getHttpServer())
                .get('/auth/google')
                .expect(302)
                .expect('location', /https:\/\/accounts\.google\.com\/o\/oauth2\/v2\/auth*/)
        });

        it('/login (GET) with redirect', async () => {
            await request(app.getHttpServer())
                .get('/login')
                .expect(302)
                .redirects(1)
                .expect(302)
        });
    });

    const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmYWU1OTdhYzRhNGYwNWE5OGUyMzM3MCIsImVtYWlsIjoiZ3VzZXZhMDc5N0BtYWlsLnJ1IiwiaWF0IjoxNjA1Mjg0MDg5LCJleHAiOjE2MDU1MDAwODl9.ICVLY-bzfH_-tFKK1coW32jG3iyyQ-uT_vH1N9oIQME'
    describe('', () => {

        it('/ok (GET)', async () => {
            await request(app.getHttpServer())
                .get('/ok')
                .set('Authorization', 'Bearer ' + jwtToken)
                .expect(200)
                .then(response => {
                    assert(response.body.email, 'guseva0797@mail.ru')
                })
        });

        it(':id (GET) profile', async () => {
            const id = '5fae597ac4a4f05a98e23370'
            await request(app.getHttpServer())
                .get('/' + id)
                .set('Authorization', 'Bearer ' + jwtToken)
                .expect(200)
                .then(response => {
                    assert(response.body.email, 'guseva0797@mail.ru')
                })
        })

        
        it(':id (GET) another user\'s profile', async () => {
            const id = '5fae59d7c4a4f05a98e23371'
            await request(app.getHttpServer())
                .get('/' + id)
                .set('Authorization', 'Bearer ' + jwtToken)
                .expect(200)
                .then(response => {
                    assert(response.body.email, 'levishok@mail.ru');
                })
        })
        
        it(':id (GET) the profile of a non-existent user', async () => {
            const id = '5fae59d7c4a4f05a98e23377'
            await request(app.getHttpServer())
                .get('/' + id)
                .set('Authorization', 'Bearer ' + jwtToken)
                .expect(404)
        })

        
        it(':id (GET) invalide user id', async () => {
            const id = '1'
            await request(app.getHttpServer())
                .get('/' + id)
                .set('Authorization', 'Bearer ' + jwtToken)
                .expect(400)
        })


        it(':id (PUT) edit profile', async () => {
            
            const id = '5fae597ac4a4f05a98e23370'
            const res = await request(app.getHttpServer())
                .get('/' + id)
                .set('Authorization', 'Bearer ' + jwtToken)
                .expect(200)
            
            
            const email = 'email@ail.ail'
            const userDto: UserDto = {...res.body}
            userDto.email = email
            const oldUserDto: UserDto = res.body

            async function editPrifile(userDto: UserDto) {
                return request(app.getHttpServer())
                .put('/' + id)
                .set('Authorization', 'Bearer ' + jwtToken)
                .send(userDto)
                .set('Accept', 'application/json')
                .expect(200)
            }

            await editPrifile(userDto).then(response => {
                assert(response.body.email, email);
            })
            await editPrifile(oldUserDto);
        })

    


    });

    // проверить как работает закрытость и открытость профилей

    afterEach(async () => {
        await app.close();
    });
});
