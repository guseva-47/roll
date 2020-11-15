import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { configModule } from 'src/configure.root';
import { UserDto } from 'src/user/dto/user.dto';
import { profilePrivatType } from 'src/user/enum/profile-privet-type.enum';

import { IUser } from 'src/user/interface/user.interface';

describe('AppController (e2e)', () => {
    let app: INestApplication;

    async function editProfile(userDto: UserDto, userId: string, jwtToken: string): Promise<request.Response> {
        return await request(app.getHttpServer())
            .put('/' + userId)
            .set('Authorization', 'Bearer ' + jwtToken)
            .send(userDto)
            .set('Accept', 'application/json')
            .expect(200)
    }

    async function getProfile(userId: string, jwtToken: string): Promise<request.Response> {
        return await request(app.getHttpServer())
            .get('/' + userId)
            .set('Authorization', 'Bearer ' + jwtToken)
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
        jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmYjE2NGU1YjMwNGU2NDY0NDFjZTJkYSIsImVtYWlsIjoiZ3VzZXZhMDc5N0BtYWlsLnJ1IiwiaWF0IjoxNjA1NDYxMjIxLCJleHAiOjE2MDU2NzcyMjF9.BvbtIUiR1KI_NvRmiZohAXhe8nMfgGnaUOQGp5bglJ8',
        id: '5fb164e5b304e646441ce2da',
        email: 'guseva0797@mail.ru',
    }
    const otherUser = {
        jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmYjE2NTAxYjMwNGU2NDY0NDFjZTJkYiIsImVtYWlsIjoibGV2aXNob2tAZ21haWwuY29tIiwiaWF0IjoxNjA1NDY3MjM5LCJleHAiOjE2MDU2ODMyMzl9.olikPf6Sh-rk75EHI9d2NugtApSmxyYVUzzIUgXiXtA',
        id: '5fb16501b304e646441ce2db',
        email: 'levishok@mail.ru',
    }
    // todo добавить название дискрайба
    describe('', () => {

        it('/ok (GET)', async (done) => {
            await request(app.getHttpServer())
                .get('/ok')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(200)
                .then(response => {
                    if (response.body.email != me.email) done.fail(`Unexpected (${response.body.email}) email.`)
                    done();
                })
        });

        it('/:id (GET) profile', async (done) => {
            await getProfile(me.id, me.jwtToken).then(response => {
                if (response.body.email != me.email) done.fail(`Unexpected (${response.body.email}) email.`);
                done();
            })
        })

        // it('/:id (GET) another user\'s profile', async (done) => {
        //     await getProfile(otherUser.id, me.jwtToken).then(response => {
        //         if (response.body.email != otherUser.email) done.fail(`Unexpected (${response.body.email}) email.`);
        //         done();
        //     })
        // })

        it('/:id (GET) the profile of a non-existent user', async () => {
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

        it('/:id (PUT) edit profile', async (done) => {
            const res = await getProfile(me.id, me.jwtToken)

            const email = 'fake@mail'
            const userDto: UserDto = { ...res.body }
            userDto.email = email
            const oldUserDto: UserDto = res.body

            await editProfile(userDto, me.id, me.jwtToken).then(response => {
                if (response.body.email != email) {
                    done.fail(`Unexpected (${response.body.email}) email.`);
                }
            })
            await editProfile(oldUserDto, me.id, me.jwtToken);
            done();
        })

        it(':id (PUT) edit someone else\'s profile', async () => {
            const res = await getProfile(otherUser.id, otherUser.jwtToken)

            const email = 'email@ail.ail'
            const userDto: UserDto = { ...res.body }
            userDto.email = email

            return request(app.getHttpServer())
                .put('/' + otherUser.id)
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send(userDto)
                .set('Accept', 'application/json')
                .expect(400)
        })

        it(':id (GET) closed user\'s profile', async (done) => {

            // отредактировать профиль другого пользователя так, чтобы он был закрытым
            const res = await getProfile(otherUser.id, otherUser.jwtToken)

            const userDto: UserDto = {...res.body}
            userDto.profilePrivatType = profilePrivatType.closed
            const oldUserDto: UserDto = res.body

            await editProfile(userDto, otherUser.id, otherUser.jwtToken).then(response => {
                if (response.body.profilePrivatType != profilePrivatType.closed) 
                    done.fail('Profile must be closed for test.');
            })

            //запрос от "меня" на закрытый профиль пользователя 
            await request(app.getHttpServer())
                .get('/' + otherUser.id)
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(403)

            await editProfile(oldUserDto, otherUser.id, otherUser.jwtToken).then(response => {
                if (response.body.profilePrivatType != profilePrivatType.open) 
                    done.fail('профиль должен быть опен в итоге');
            })
            done();
        })
    });

    // describe('testing user freinds controller', () => {
    //     async function subscribe(otherUserId: string, jwtToken: string) {
    //         return request(app.getHttpServer())
    //         .post('/sub')
    //         .set('Authorization', 'Bearer ' + jwtToken)
    //         .send(otherUserId)
    //         .set('Accept', 'application/json')
    //         .expect(200)
    //     }

    //     it('/sub (POST) subscribe to otherUser (open profile)', async (done) => {
    //         let user: IUser = (await getProfile(otherUser.id, otherUser.jwtToken)).body
    //         //if (user.profilePrivatType != profilePrivatType.closed) done.fail('Profile must be open');
    //         // await subscribe(otherUser.id, me.jwtToken).then(async response => {
    //         //     const isSubscription: boolean = response.body.subscriptions.includes(otherUser.id);

    //         //     user = (await getProfile(otherUser.id, otherUser.jwtToken)).body
    //         //     const isSubscriber: boolean =  user.subscribers.includes(me.id)

    //         //     //return isSubscriber && isSubscription
    //         //     return true
    //         // })
    //     });

    //     // it('/sub (POST) subscribe to otherUser (closed profile)', async () => {
    //     //     await subscribe(otherUser.id, me.jwtToken).then(response => {
    //     //         response.body.subscriptions.includes(otherUser.id);
    //     //     })
    //     // });
    // });

    afterEach(async () => {
        await app.close();
    });
});
