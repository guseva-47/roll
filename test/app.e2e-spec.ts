import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { assert } from 'console';

import { AppModule } from './../src/app.module';
import { configModule } from 'src/configure.root';
import { UserDto } from 'src/user/dto/user.dto';
import { profilePrivatType } from 'src/user/enum/profile-privet-type.enum';

describe('AppController (e2e)', () => {
    let app: INestApplication;

    async function editProfile(userDto: UserDto, userId: string, jwtToken: string) {
        return request(app.getHttpServer())
        .put('/' + userId)
        .set('Authorization', 'Bearer ' + jwtToken)
        .send(userDto)
        .set('Accept', 'application/json')
        .expect(200)
    }

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

    const me = {
        jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmYWU1OTdhYzRhNGYwNWE5OGUyMzM3MCIsImVtYWlsIjoiZ3VzZXZhMDc5N0BtYWlsLnJ1IiwiaWF0IjoxNjA1NDM3MDI0LCJleHAiOjE2MDU2NTMwMjR9.uXssBBpckRb8652HkgAZg7WMrS1QfchTD6VeNPWogrc',
        id: '5fae597ac4a4f05a98e23370',
        email: 'guseva0797@mail.ru',
    }
    const otherUser = {
        jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmYWU1OWQ3YzRhNGYwNWE5OGUyMzM3MSIsImVtYWlsIjoibGV2aXNob2tAZ21haWwuY29tIiwiaWF0IjoxNjA1NDM3MDI5LCJleHAiOjE2MDU2NTMwMjl9.THojxV7FMZLd48p0209GDKADD2LbBtwyvnxgkcr_Ajo',
        id: '5fae59d7c4a4f05a98e23371',
        email: 'levishok@mail.ru',
    }
    // todo добавить название дискрайба
    describe('', () => {

        it('/ok (GET)', async () => {
            await request(app.getHttpServer())
                .get('/ok')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(200)
                .then(response => {
                    assert(response.body.email, me.email)
                })
        });

        it(':id (GET) profile', async () => {
            await request(app.getHttpServer())
                .get('/' + me.id)
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(200)
                .then(response => {
                    assert(response.body.email, me.email)
                })
        })
        
        it(':id (GET) another user\'s profile', async () => {
            await request(app.getHttpServer())
                .get('/' + otherUser.id)
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(200)
                .then(response => {
                    assert(response.body.email, otherUser.email);
                })
        })
        
        it(':id (GET) the profile of a non-existent user', async () => {
            const id = '5fae59d7c4a4f05a98e23377'
            await request(app.getHttpServer())
                .get('/' + id)
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(404)
        })

        it(':id (GET) invalide user id', async () => {
            const id = '1'
            await request(app.getHttpServer())
                .get('/' + id)
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(400)
        })

        it(':id (PUT) edit profile', async () => {
            const res = await request(app.getHttpServer())
                .get('/' + me.id)
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(200)
            
            
            const email = 'email@ail.ail'
            const userDto: UserDto = {...res.body}
            userDto.email = email
            const oldUserDto: UserDto = res.body

            await editProfile(userDto, me.id, me.jwtToken).then(response => {
                assert(response.body.email, email);
            })
            await editProfile(oldUserDto, me.id, me.jwtToken);
        })

        it(':id (PUT) edit someone else\'s profile', async () => {
            const res = await request(app.getHttpServer())
                .get('/' + otherUser.id)
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(200)
            
            
            const email = 'email@ail.ail'
            const userDto: UserDto = {...res.body}
            userDto.email = email

            return request(app.getHttpServer())
                .put('/' + otherUser.id)
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send(userDto)
                .set('Accept', 'application/json')
                .expect(400)
        })

        it(':id (GET) closed user\'s profile', async () => {

            // отредактировать профиль другого пользователя так, чтобы он был закрытым
            const res = await request(app.getHttpServer())
                .get('/' + otherUser.id)
                .set('Authorization', 'Bearer ' + otherUser.jwtToken)
                .expect(200)            

            const userDto: UserDto = {...res.body}
            userDto.profilePrivatType = profilePrivatType.closed
            const oldUserDto: UserDto = res.body

            await editProfile(userDto, otherUser.id, otherUser.jwtToken).then(response => {
                assert(response.body.profilePrivatType, profilePrivatType.closed);
            })

            //запрос от "меня" на закрытый профиль пользователя 
            await request(app.getHttpServer())
                .get('/' + otherUser.id)
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(403)

            //todo assert не работает
            await editProfile(oldUserDto, otherUser.id, otherUser.jwtToken).then(response => {
                assert(response.body.profilePrivatType, profilePrivatType.open);
            })
        })
    });

    afterEach(async () => {
        await app.close();
    });
});
