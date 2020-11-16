import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { configModule } from 'src/configure.root';
import { UserDto } from 'src/user/dto/user.dto';
import { profilePrivatType } from 'src/user/enum/profile-privet-type.enum';

import { IUser } from 'src/user/interface/user.interface';
import { doesNotMatch } from 'assert';

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

    function deepCopyUser(user) {
        const newUser = {...user}
        newUser.roles = user.roles.slice()
        newUser.subscribers = user.subscribers.slice()
        newUser.subscriptions = user.subscriptions.slice()
        newUser.subscrReqsToMe = user.subscrReqsToMe.slice()
        newUser.subscrReqsFromMe = user.subscrReqsFromMe.slice()
        newUser.ignoreUsers = user.ignoreUsers.slice()
        
        return newUser
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
        email: 'levishok@gmail.com',
    }
    // todo добавить название дискрайба
    describe('', () => {

        it('/ok (GET)', async (done) => {
            await request(app.getHttpServer())
                .get('/ok')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(200)
                .then(response => {
                    if (response.body.email !== me.email) done.fail(`Unexpected (${response.body.email}) email.`)
                    done();
                })
        });

        it('/:id (GET) profile', async (done) => {
            await getProfile(me.id, me.jwtToken).then(response => {
                if (response.body.email !== me.email) done.fail(`Unexpected (${response.body.email}) email.`);
                done();
            })
        })

        it('/:id (GET) another user\'s profile', async (done) => {
            await getProfile(otherUser.id, me.jwtToken).then(response => {
                if (response.body.email !== otherUser.email) done.fail(`Unexpected (${response.body.email}) email.`);
                done();
            })
        })

        it('/:id (GET) the profile of a non-existent user', async () => {
            const id = '5fae59d7c4a4f05a98e23377'
            await request(app.getHttpServer())
                .get('/' + id)
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(404)
        })

        it('/:id (GET) invalide user id', async () => {
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
                if (response.body.email !== email) {
                    done.fail(`Unexpected (${response.body.email}) email.`);
                }
            })
            await editProfile(oldUserDto, me.id, me.jwtToken);
            done();
        })

        it('/:id (PUT) edit someone else\'s profile', async () => {
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

        it('/:id (GET) closed user\'s profile', async (done) => {

            // отредактировать профиль другого пользователя так, чтобы он был закрытым
            const res = await getProfile(otherUser.id, otherUser.jwtToken)

            const userDto: UserDto = {...res.body}
            userDto.profilePrivatType = profilePrivatType.closed
            const oldUserDto: UserDto = res.body

            await editProfile(userDto, otherUser.id, otherUser.jwtToken).then(response => {
                if (response.body.profilePrivatType !== profilePrivatType.closed) 
                    done.fail('Profile must be closed for test.');
            })

            //запрос от "меня" на закрытый профиль пользователя 
            await request(app.getHttpServer())
                .get('/' + otherUser.id)
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(403)

            await editProfile(oldUserDto, otherUser.id, otherUser.jwtToken).then(response => {
                if (response.body.profilePrivatType !== profilePrivatType.open) 
                    done.fail('Profile must be open for test.');
            })
            done();
        })
    });

    describe('testing user freinds controller', () => {
        
        async function subscribe(otherUserId: string, jwtToken: string) {
            return request(app.getHttpServer())
                .post('/sub')
                .set('Authorization', 'Bearer ' + jwtToken)
                .send({id: otherUserId})
                .set('Accept', 'application/json')
                .expect(201)
        }

        it('/sub (POST) subscribe to otherUser (open profile)', async (done) => {
            const userMe = (await getProfile(me.id, me.jwtToken)).body

            const userOther = (await getProfile(otherUser.id, otherUser.jwtToken)).body
            if (userOther.profilePrivatType !== profilePrivatType.open) done.fail('Profile must be open');
            
            await subscribe(otherUser.id, me.jwtToken).then(async response => {

                const newUserMe: IUser = response.body;
                const isSubscription: boolean = newUserMe.subscriptions.includes(otherUser.id);

                const newUserOther: IUser = (await getProfile(otherUser.id, otherUser.jwtToken)).body
                const isSubscriber: boolean =  newUserOther.subscribers.includes(me.id)

                //возврат профилей в прежнее состояние
                await editProfile(userMe, me.id, me.jwtToken)
                await editProfile(userOther, otherUser.id, otherUser.jwtToken)

                if (!isSubscription || !isSubscriber) 
                    done.fail(`isSubscription = ${isSubscription} and isSubscriber = ${isSubscriber}`)
            })

            done();
        });

        it('/sub (POST) subscribe to myself', async () => {
            request(app.getHttpServer())
                .post('/sub')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send({id: me.id})
                .set('Accept', 'application/json')
                .expect(400)
        });

        it('/sub (POST) subscribe twice to open profile', async (done) => {
            const userMeOld = (await getProfile(me.id, me.jwtToken)).body

            const userOtherOld = (await getProfile(otherUser.id, otherUser.jwtToken)).body
            if (userOtherOld.profilePrivatType !== profilePrivatType.open) done.fail('Profile must be open');
            
            let userMe2: IUser
            let userOther2: IUser
            await subscribe(otherUser.id, me.jwtToken).then(async response => {

                userMe2 = response.body;
                const isSubscription: boolean = userMe2.subscriptions.includes(otherUser.id);

                userOther2 = (await getProfile(otherUser.id, otherUser.jwtToken)).body
                const isSubscriber: boolean =  userOther2.subscribers.includes(me.id)


                if (!isSubscription || !isSubscriber) 
                    done.fail(`isSubscription = ${isSubscription} and isSubscriber = ${isSubscriber}`)
            })

            await subscribe(otherUser.id, me.jwtToken).then(async response => {
                // todo
                const userMe3: IUser = response.body;
                console.log(`userMe2.subscriptions = ${userMe2.subscriptions} ?== userMe3.subscriptions = ${userMe3.subscriptions}`)
                console.log((userMe3.subscriptions === userMe2.subscriptions))
                // if (userMe3.subscriptions !== userMe2.subscriptions) 
                //     done.fail();

                const userOther3: IUser = (await getProfile(otherUser.id, otherUser.jwtToken)).body
                console.log(`userOther3.subscribers = ${userOther3.subscribers} ?== userOther2.subscribers = ${userOther2.subscribers}`)
                console.log((userOther3.subscribers !== userOther2.subscribers))
                // if (userOther3.subscribers != userOther2.subscribers) 
                //     done.fail();
            })

            //возврат профилей в прежнее состояние
            await editProfile(userMeOld, me.id, me.jwtToken)
            await editProfile(userOtherOld, otherUser.id, otherUser.jwtToken)

            done();

        });

        it('/sub (POST) subscribe twice to closed profile', async (done) => {
            const userMeOld = (await getProfile(me.id, me.jwtToken)).body
            const userMe = deepCopyUser(userMeOld)
            userMe.subscriptions.push(otherUser.id)
            editProfile(userMe, me.id, me.jwtToken)

            const userOtherOld = (await getProfile(otherUser.id, otherUser.jwtToken)).body
            const userOther = deepCopyUser(userOtherOld)
            userOther.profilePrivatType = profilePrivatType.closed
            userOther.subscribers.push(me.id)
            editProfile(userOther, otherUser.id, otherUser.jwtToken)

            if (userOther.profilePrivatType !== profilePrivatType.closed) done.fail('Profile must be closed');

            await subscribe(otherUser.id, me.jwtToken).then(async response => {
                // todo
                const userMe2: IUser = response.body;
                // if (userMe2.subscriptions !== userMe.subscriptions) 
                //     done.fail();
                // if (userMe2.subscrReqsFromMe !== userMe.subscrReqsFromMe) 
                //     done.fail();

                const userOther2: IUser = (await getProfile(otherUser.id, otherUser.jwtToken)).body
                console.log(`userOther2.subscribers = ${userOther2.subscribers} ?== userOther.subscribers = ${userOther2.subscribers}`)
                console.log((userOther2.subscribers !== userMe.subscribers))
                // if (userOther2.subscribers != userOther.subscribers) 
                //     done.fail();
                // if (userOther2.subscribers != userOther.subscribers) 
                //     done.fail();
            })

            //возврат профилей в начальное состояние
            await editProfile(userMeOld, me.id, me.jwtToken)
            await editProfile(userOtherOld, otherUser.id, otherUser.jwtToken)

            done();

        });

        it('/sub (POST) subscribe to otherUser (closed profile)', async (done) => {
            const userMeOld = deepCopyUser((await getProfile(me.id, me.jwtToken)).body)

            const userOther = (await getProfile(otherUser.id, otherUser.jwtToken)).body
            const newUserOther = deepCopyUser(userOther)
            newUserOther.profilePrivatType = profilePrivatType.closed
            editProfile(newUserOther, otherUser.id, otherUser.jwtToken)
            
            await subscribe(otherUser.id, me.jwtToken).then(async response => {
                const newUserMe: IUser = response.body;
                const isSubscription: boolean = newUserMe.subscriptions.includes(otherUser.id)
                const isSendedRequest: boolean = newUserMe.subscrReqsFromMe.includes(otherUser.id)

                const newUserOther: IUser = (await getProfile(otherUser.id, otherUser.jwtToken)).body
                const isSubscriber: boolean =  newUserOther.subscribers.includes(me.id)
                const isResivedRequest: boolean = newUserOther.subscrReqsToMe.includes(me.id)

                //возврат профилей в прежнее состояние
                await editProfile(userMeOld, me.id, me.jwtToken)
                await editProfile(userOther, otherUser.id, otherUser.jwtToken)

                if (isSubscription || isSubscriber) done.fail(`isSubscription = ${isSubscription} and isSubscriber = ${isSubscriber}`)
                if (!isSendedRequest || !isResivedRequest) done.fail(`isSendedRequest = ${isSendedRequest} and isResivedRequest = ${isResivedRequest}`)
            })

            done();
        });
        
        it('/sub (POST) try suscribe to non-existent user', async () => {
            const id = '5fae59d7c4a4f05a98e23377'
            request(app.getHttpServer())
                .post('/sub')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send({id: id})
                .set('Accept', 'application/json')
                .expect(404)
        });

        it('/sub (POST) try suscribe with invalid id', async () => {
            const id = '1'
            request(app.getHttpServer())
                .post('/sub')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send({id: id})
                .set('Accept', 'application/json')
                .expect(400)
        });

        //подписать на закрытый профиль, если ты уже отправил ему запрос
        it('/sub (POST) try send request to subsribe twice (to closed profile)', async (done) => {
            const userMeOld = deepCopyUser((await getProfile(me.id, me.jwtToken)).body)

            const userOtherOld = (await getProfile(otherUser.id, otherUser.jwtToken)).body
            let userOther = deepCopyUser(userOtherOld)
            userOther.profilePrivatType = profilePrivatType.closed
            editProfile(userOther, otherUser.id, otherUser.jwtToken)
            
            await subscribe(otherUser.id, me.jwtToken)
            const userMe = (await getProfile(me.id, me.jwtToken)).body
            userOther = (await getProfile(otherUser.id, otherUser.jwtToken)).body

            await subscribe(otherUser.id, me.jwtToken)
            const userMe2 = (await getProfile(me.id, me.jwtToken)).body
            const userOther2 = (await getProfile(otherUser.id, otherUser.jwtToken)).body

            // if (userMe.subscrReqsFromMe !== userMe2.subscrReqsFromMe) done.fail()
            // if (userOther.subscrReqsToMe !== userOther2.subscrReqsToMe) done.fail()

            //возврат профилей в прежнее состояние
            await editProfile(userMeOld, me.id, me.jwtToken)
            await editProfile(userOtherOld, otherUser.id, otherUser.jwtToken)

            done();
        });

        // принять заявку на подписку
        it('/approvesub (POST) approve request to sub', async (done) => {
            const userMeOld = (await getProfile(me.id, me.jwtToken)).body
            let userMe = deepCopyUser(userMeOld)
            userMe.profilePrivatType = profilePrivatType.closed
            editProfile(userMe, me.id, me.jwtToken)

            const userOtherOld = (await getProfile(otherUser.id, otherUser.jwtToken)).body
            let userOther = deepCopyUser(userOtherOld)
            
            await subscribe(me.id, otherUser.jwtToken)

            await request(app.getHttpServer())
                .post('/approvesub')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send({id: otherUser.id})
                .set('Accept', 'application/json')
                .expect(201)

            userMe = (await getProfile(me.id, me.jwtToken)).body
            userOther = (await getProfile(otherUser.id, otherUser.jwtToken)).body

            if (!userMe.subscribers.includes(otherUser.id)) done.fail()
            if (userMe.subscrReqsToMe.includes(otherUser.id)) done.fail()
            if (!userOther.subscriptions.includes(me.id)) done.fail()
            if (userOther.subscrReqsFromMe.includes(me.id)) done.fail()

            //возврат профилей в прежнее состояние
            await editProfile(userMeOld, me.id, me.jwtToken)
            await editProfile(userOtherOld, otherUser.id, otherUser.jwtToken)

            done();
        });
        // юзер не найден, юзер не существует, заявки не существует, ваш профиль не приватный

        // отклонить заявку на подписку
        it('/unapprovesub (POST) unapprove request to sub', async (done) => {
            const userMeOld = (await getProfile(me.id, me.jwtToken)).body
            let userMe = deepCopyUser(userMeOld)
            userMe.profilePrivatType = profilePrivatType.closed
            editProfile(userMe, me.id, me.jwtToken)

            const userOtherOld = (await getProfile(otherUser.id, otherUser.jwtToken)).body
            let userOther = deepCopyUser(userOtherOld)
            
            await subscribe(me.id, otherUser.jwtToken)

            await request(app.getHttpServer())
                .post('/unapprovesub')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send({id: otherUser.id})
                .set('Accept', 'application/json')
                .expect(201)

            userMe = (await getProfile(me.id, me.jwtToken)).body
            userOther = (await getProfile(otherUser.id, otherUser.jwtToken)).body

            if (userMe.subscribers.includes(otherUser.id)) done.fail()
            if (userMe.subscrReqsToMe.includes(otherUser.id)) done.fail()
            if (userOther.subscriptions.includes(me.id)) done.fail()
            if (userOther.subscrReqsFromMe.includes(me.id)) done.fail()

            //возврат профилей в прежнее состояние
            await editProfile(userMeOld, me.id, me.jwtToken)
            await editProfile(userOtherOld, otherUser.id, otherUser.jwtToken)

            done();
        });


        it('___edit profile', async (done) => {
            const flag = false
            if (flag) {
                const res = await getProfile(otherUser.id, otherUser.jwtToken)

                const userDtoOther: UserDto = { ...res.body }
                userDtoOther.subscrReqsToMe = []
                userDtoOther.subscribers = []
                userDtoOther.subscriptions = []
                userDtoOther.subscrReqsFromMe = []
                userDtoOther.profilePrivatType = profilePrivatType.open
                await editProfile(userDtoOther, otherUser.id, otherUser.jwtToken)

                const res2 = await getProfile(me.id, me.jwtToken)

                const userDtoMe: UserDto = { ...res2.body }
                userDtoMe.subscrReqsFromMe = []
                userDtoMe.subscriptions = []
                userDtoMe.subscribers = []
                userDtoMe.subscrReqsToMe = []
                userDtoMe.profilePrivatType = profilePrivatType.open
                await editProfile(userDtoMe, me.id, me.jwtToken)
            }
            done();
        })
    });

    afterEach(async () => {
        await app.close();
    });
});
