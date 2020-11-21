import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { configModule } from 'src/configure.root';
import { UserDto } from 'src/user/dto/user.dto';
import { profilePrivatType } from 'src/user/enum/profile-privet-type.enum';

import { IUser } from 'src/user/interface/user.interface';
import { meUserTestData, otherUserTestData } from './data';

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

    async function _subscribe(otherUserId: string, jwtToken: string) {
        return await request(app.getHttpServer())
            .post('/sub')
            .set('Authorization', 'Bearer ' + jwtToken)
            .send({id: otherUserId})
            .set('Accept', 'application/json')
            .expect(201)
    }

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [configModule, AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    describe('service for testing', () => {
        it('___edit profile', async () => {
            const flag = true
            if (flag) {
                const res = await _getProfile(otherUser.id, otherUser.jwtToken)

                const userDtoOther: UserDto = { ...res.body }
                userDtoOther.subscrReqsToMe = []
                userDtoOther.subscribers = []
                userDtoOther.subscriptions = []
                userDtoOther.subscrReqsFromMe = []
                userDtoOther.profilePrivatType = profilePrivatType.open
                await _editProfile(userDtoOther, otherUser.id, otherUser.jwtToken)

                const res2 = await _getProfile(me.id, me.jwtToken)

                const userDtoMe: UserDto = { ...res2.body }
                userDtoMe.subscrReqsFromMe = []
                userDtoMe.subscriptions = []
                userDtoMe.subscribers = []
                userDtoMe.subscrReqsToMe = []
                userDtoMe.profilePrivatType = profilePrivatType.open
                await _editProfile(userDtoMe, me.id, me.jwtToken)
            }
        })
    });
    
    describe('subscribe user from freinds controller', () => {

        it('/sub (POST) subscribe to otherUser (open profile)', async (done) => {
            const userMe = (await _getProfile(me.id, me.jwtToken)).body

            const userOther = (await _getProfile(otherUser.id, otherUser.jwtToken)).body
            if (userOther.profilePrivatType !== profilePrivatType.open) done.fail('Profile must be open');
            
            await _subscribe(otherUser.id, me.jwtToken).then(async response => {

                const newUserMe: IUser = response.body;
                const isSubscription: boolean = newUserMe.subscriptions.includes(otherUser.id);

                const newUserOther: IUser = (await _getProfile(otherUser.id, otherUser.jwtToken)).body
                const isSubscriber: boolean =  newUserOther.subscribers.includes(me.id)

                //возврат профилей в прежнее состояние
                await _editProfile(userMe, me.id, me.jwtToken)
                await _editProfile(userOther, otherUser.id, otherUser.jwtToken)

                if (!isSubscription || !isSubscriber) 
                    done.fail(`isSubscription = ${isSubscription} and isSubscriber = ${isSubscriber}`)
            })

            done();
        });

        it('/sub (POST) subscribe to myself', async () => {
            await request(app.getHttpServer())
                .post('/sub')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send({id: me.id})
                .set('Accept', 'application/json')
                .expect(400)
        });

        it('/sub (POST) subscribe twice to open profile', async (done) => {
            const userMeOld = (await _getProfile(me.id, me.jwtToken)).body

            const userOtherOld = (await _getProfile(otherUser.id, otherUser.jwtToken)).body
            if (userOtherOld.profilePrivatType !== profilePrivatType.open) done.fail('Profile must be open');
            
            let userMe2: IUser
            let userOther2: IUser
            await _subscribe(otherUser.id, me.jwtToken).then(async response => {

                userMe2 = response.body;
                const isSubscription: boolean = userMe2.subscriptions.includes(otherUser.id);

                userOther2 = (await _getProfile(otherUser.id, otherUser.jwtToken)).body
                const isSubscriber: boolean =  userOther2.subscribers.includes(me.id)


                if (!isSubscription || !isSubscriber) 
                    done.fail(`isSubscription = ${isSubscription} and isSubscriber = ${isSubscriber}`)
            })

            await _subscribe(otherUser.id, me.jwtToken).then(async response => {
                
                const userMe3: IUser = response.body;
                if (userMe3.subscriptions.length !== userMe2.subscriptions.length) 
                    done.fail();

                const userOther3: IUser = (await _getProfile(otherUser.id, otherUser.jwtToken)).body
                if (userOther3.subscribers.length != userOther2.subscribers.length) 
                    done.fail();
            })

            //возврат профилей в прежнее состояние
            await _editProfile(userMeOld, me.id, me.jwtToken)
            await _editProfile(userOtherOld, otherUser.id, otherUser.jwtToken)

            done();

        });

        it('/sub (POST) subscribe twice to closed profile', async (done) => {
            const userMeOld = (await _getProfile(me.id, me.jwtToken)).body
            const userMe = _deepCopyUser(userMeOld)
            userMe.subscriptions.push(otherUser.id)
            _editProfile(userMe, me.id, me.jwtToken)

            const userOtherOld = (await _getProfile(otherUser.id, otherUser.jwtToken)).body
            const userOther = _deepCopyUser(userOtherOld)
            userOther.profilePrivatType = profilePrivatType.closed
            userOther.subscribers.push(me.id)
            _editProfile(userOther, otherUser.id, otherUser.jwtToken)

            if (userOther.profilePrivatType !== profilePrivatType.closed) done.fail('Profile must be closed');

            await _subscribe(otherUser.id, me.jwtToken).then(async response => {

                const userMe2: IUser = response.body;
                if (userMe2.subscriptions.length !== userMe.subscriptions.length) 
                    done.fail();
                if (userMe2.subscrReqsFromMe.length !== userMe.subscrReqsFromMe.length) 
                    done.fail();

                const userOther2: IUser = (await _getProfile(otherUser.id, otherUser.jwtToken)).body
                if (userOther2.subscribers.length != userOther.subscribers.length) 
                    done.fail();
                if (userOther2.subscribers.length != userOther.subscribers.length) 
                    done.fail();
            })

            //возврат профилей в начальное состояние
            await _editProfile(userMeOld, me.id, me.jwtToken)
            await _editProfile(userOtherOld, otherUser.id, otherUser.jwtToken)

            done();

        });

        it('/sub (POST) subscribe to otherUser (closed profile)', async (done) => {
            const userMeOld = _deepCopyUser((await _getProfile(me.id, me.jwtToken)).body)

            const userOther = (await _getProfile(otherUser.id, otherUser.jwtToken)).body
            const newUserOther = _deepCopyUser(userOther)
            newUserOther.profilePrivatType = profilePrivatType.closed
            _editProfile(newUserOther, otherUser.id, otherUser.jwtToken)
            
            await _subscribe(otherUser.id, me.jwtToken).then(async response => {
                const newUserMe: IUser = response.body;
                const isSubscription: boolean = newUserMe.subscriptions.includes(otherUser.id)
                const isSendedRequest: boolean = newUserMe.subscrReqsFromMe.includes(otherUser.id)

                const newUserOther: IUser = (await _getProfile(otherUser.id, otherUser.jwtToken)).body
                const isSubscriber: boolean =  newUserOther.subscribers.includes(me.id)
                const isResivedRequest: boolean = newUserOther.subscrReqsToMe.includes(me.id)

                //возврат профилей в прежнее состояние
                await _editProfile(userMeOld, me.id, me.jwtToken)
                await _editProfile(userOther, otherUser.id, otherUser.jwtToken)

                if (isSubscription || isSubscriber) done.fail(`isSubscription = ${isSubscription} and isSubscriber = ${isSubscriber}`)
                if (!isSendedRequest || !isResivedRequest) done.fail(`isSendedRequest = ${isSendedRequest} and isResivedRequest = ${isResivedRequest}`)
            })

            done();
        });
        
        it('/sub (POST) try suscribe to non-existent user', async () => {
            await request(app.getHttpServer())
                .post('/sub')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send({id: nonExistenId})
                .set('Accept', 'application/json')
                .expect(404)
        });

        it('/sub (POST) try suscribe with invalid id', async () => {
            const id = '1'
            await request(app.getHttpServer())
                .post('/sub')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send({id: id})
                .set('Accept', 'application/json')
                .expect(400)
        });

        //подписать на закрытый профиль, если ты уже отправил ему запрос
        it('/sub (POST) try send request to subsribe twice (to closed profile)', async (done) => {
            const userMeOld = _deepCopyUser((await _getProfile(me.id, me.jwtToken)).body)

            const userOtherOld = (await _getProfile(otherUser.id, otherUser.jwtToken)).body
            let userOther = _deepCopyUser(userOtherOld)
            userOther.profilePrivatType = profilePrivatType.closed
            _editProfile(userOther, otherUser.id, otherUser.jwtToken)
            
            await _subscribe(otherUser.id, me.jwtToken)
            const userMe = (await _getProfile(me.id, me.jwtToken)).body
            userOther = (await _getProfile(otherUser.id, otherUser.jwtToken)).body

            await _subscribe(otherUser.id, me.jwtToken)
            const userMe2 = (await _getProfile(me.id, me.jwtToken)).body
            const userOther2 = (await _getProfile(otherUser.id, otherUser.jwtToken)).body

            if (userMe.subscrReqsFromMe.length !== userMe2.subscrReqsFromMe.length) done.fail()
            if (userOther.subscrReqsToMe.length !== userOther2.subscrReqsToMe.length) done.fail()

            //возврат профилей в прежнее состояние
            await _editProfile(userMeOld, me.id, me.jwtToken)
            await _editProfile(userOtherOld, otherUser.id, otherUser.jwtToken)

            done();
        });
    });
    
    describe('working with user subscription requests', () => {
        // принять заявку на подписку
        it('/approvesub (POST) approve request to sub', async (done) => {
            const userMeOld = (await _getProfile(me.id, me.jwtToken)).body
            let userMe = _deepCopyUser(userMeOld)
            userMe.profilePrivatType = profilePrivatType.closed
            _editProfile(userMe, me.id, me.jwtToken)

            const userOtherOld = (await _getProfile(otherUser.id, otherUser.jwtToken)).body
            let userOther = _deepCopyUser(userOtherOld)
            
            await _subscribe(me.id, otherUser.jwtToken)

            await request(app.getHttpServer())
                .post('/approvesub')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send({id: otherUser.id})
                .set('Accept', 'application/json')
                .expect(201)

            userMe = (await _getProfile(me.id, me.jwtToken)).body
            userOther = (await _getProfile(otherUser.id, otherUser.jwtToken)).body

            if (!userMe.subscribers.includes(otherUser.id)) done.fail()
            if (userMe.subscrReqsToMe.includes(otherUser.id)) done.fail()
            if (!userOther.subscriptions.includes(me.id)) done.fail()
            if (userOther.subscrReqsFromMe.includes(me.id)) done.fail()

            //возврат профилей в прежнее состояние
            await _editProfile(userMeOld, me.id, me.jwtToken)
            await _editProfile(userOtherOld, otherUser.id, otherUser.jwtToken)

            done();
        });

        // если заявки не существует
        it('/approvesub and /unapproved (POST) approve and unapprove non-existed request', async (done) => {
            const userMeOld = (await _getProfile(me.id, me.jwtToken)).body
            let userMe = _deepCopyUser(userMeOld)
            userMe.profilePrivatType = profilePrivatType.closed
            _editProfile(userMe, me.id, me.jwtToken)

            await request(app.getHttpServer())
                .post('/approvesub')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send({id: otherUser.id})
                .set('Accept', 'application/json')
                .expect(400)

            userMe = (await _getProfile(me.id, me.jwtToken)).body
            //возврат профилей в прежнее состояние
            await _editProfile(userMeOld, me.id, me.jwtToken)

            done();
        });

        // принять и отказать заявку на подписку, от несуществующего пользователя
        it('/approvesub and /unapproved (POST) approve and unapprove request from non-existen user', async (done) => {
            const userMeOld = (await _getProfile(me.id, me.jwtToken)).body
            const userMe = _deepCopyUser(userMeOld)
            userMe.profilePrivatType = profilePrivatType.closed
            // добавление запроса на подписку от некорректного пользователя
            userMe.subscrReqsToMe.push(nonExistenId)
            _editProfile(userMe, me.id, me.jwtToken)

            await request(app.getHttpServer())
                .post('/approvesub')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send({id: nonExistenId})
                .set('Accept', 'application/json')
                .expect(404)
            
            await request(app.getHttpServer())
                .post('/unapprovesub')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send({id: nonExistenId})
                .set('Accept', 'application/json')
                .expect(404)

            //возврат профилей в прежнее состояние
            await _editProfile(userMeOld, me.id, me.jwtToken)

            done();
        });

        // отклонить заявку на подписку
        it('/unapprovesub (POST) unapprove request to sub', async (done) => {
            const userMeOld = (await _getProfile(me.id, me.jwtToken)).body
            let userMe = _deepCopyUser(userMeOld)
            userMe.profilePrivatType = profilePrivatType.closed
            _editProfile(userMe, me.id, me.jwtToken)

            const userOtherOld = (await _getProfile(otherUser.id, otherUser.jwtToken)).body
            let userOther = _deepCopyUser(userOtherOld)
            
            await _subscribe(me.id, otherUser.jwtToken)

            await request(app.getHttpServer())
                .post('/unapprovesub')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send({id: otherUser.id})
                .set('Accept', 'application/json')
                .expect(201)

            userMe = (await _getProfile(me.id, me.jwtToken)).body
            userOther = (await _getProfile(otherUser.id, otherUser.jwtToken)).body

            if (userMe.subscribers.includes(otherUser.id)) done.fail()
            if (userMe.subscrReqsToMe.includes(otherUser.id)) done.fail()
            if (userOther.subscriptions.includes(me.id)) done.fail()
            if (userOther.subscrReqsFromMe.includes(me.id)) done.fail()

            //возврат профилей в прежнее состояние
            await _editProfile(userMeOld, me.id, me.jwtToken)
            await _editProfile(userOtherOld, otherUser.id, otherUser.jwtToken)

            done();
        });

        // если ваш профиль не приватный
        // принять и отказать заявку на подписку, от несуществующего пользователя
        it('/approvesub and /unapproved (POST) approve and unapprove request from non-existen user', async (done) => {
            const userMeOld = (await _getProfile(me.id, me.jwtToken)).body
            const userMe = _deepCopyUser(userMeOld)
            userMe.profilePrivatType = profilePrivatType.open
            // добавление запроса на подписку от пользователя
            userMe.subscrReqsToMe.push(otherUser.id)
            _editProfile(userMe, me.id, me.jwtToken)

            await request(app.getHttpServer())
                .post('/approvesub')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send({id: otherUser.id})
                .set('Accept', 'application/json')
                .expect(400)
            
            await request(app.getHttpServer())
                .post('/unapprovesub')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send({id: nonExistenId})
                .set('Accept', 'application/json')
                .expect(400)

            //возврат профилей в прежнее состояние
            await _editProfile(userMeOld, me.id, me.jwtToken)

            done();
        });
    });

    describe('working with user unsubscription requests', () => {
        it('/unsub (POST) unsubscribe from otherUser', async (done) => {
            const userMe = (await _getProfile(me.id, me.jwtToken)).body
            const userOther = (await _getProfile(otherUser.id, otherUser.jwtToken)).body
            
            await _subscribe(otherUser.id, me.jwtToken);
            await request(app.getHttpServer())
                .post('/unsub')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send({id: otherUser.id})
                .set('Accept', 'application/json')
                .expect(201)
                .then(async response => {
                    const userMe:IUser = response.body;
                    const userOther:IUser = (await _getProfile(otherUser.id, otherUser.jwtToken)).body;

                    if (userMe.subscriptions.includes(userOther.id)) done.fail();
                    if (userOther.subscribers.includes(userMe.id)) done.fail();
                })

            //возврат профилей в прежнее состояние
            await _editProfile(userMe, me.id, me.jwtToken)
            await _editProfile(userOther, otherUser.id, otherUser.jwtToken)
            done();
        });

        it('/sub (DELETE) delete a subscriber', async (done) => { 
            const userMe = _deepCopyUser((await _getProfile(me.id, me.jwtToken)).body)
            const userOther = _deepCopyUser((await _getProfile(otherUser.id, otherUser.jwtToken)).body)
            
            await _subscribe(me.id, otherUser.jwtToken);

            const newUserMe = (await _getProfile(me.id, me.jwtToken)).body
            newUserMe.profilePrivatType = profilePrivatType.closed
            await _editProfile(newUserMe, me.id, me.jwtToken)

            await request(app.getHttpServer())
                .delete('/sub')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send({id: otherUser.id})
                .set('Accept', 'application/json')
                .expect(200)
                .then(async response => {
                    const userMe:IUser = response.body;
                    const userOther:IUser = (await _getProfile(otherUser.id, otherUser.jwtToken)).body;

                    if (userMe.subscribers.includes(userOther.id)) done.fail();
                    if (userOther.subscriptions.includes(userMe.id)) done.fail();
                })

            //возврат профилей в прежнее состояние
            await _editProfile(userMe, me.id, me.jwtToken)
            await _editProfile(userOther, otherUser.id, otherUser.jwtToken)
            done();
        });
    })

    describe('get subscribers and subscriptions', () => {

        it('/:id/subscribers (GET) subscribers of myself', async (done) => {
            const userMe = _deepCopyUser((await _getProfile(me.id, me.jwtToken)).body)
            const userOther = _deepCopyUser((await _getProfile(otherUser.id, otherUser.jwtToken)).body)
            
            await _subscribe(me.id, otherUser.jwtToken);
            await request(app.getHttpServer())
                .get('/' + me.id + '/subscribers')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(200)
                .then(response => {
                    const users = response.body
                    const indx = users.findIndex(current => current._id  === otherUser.id)
                    if (indx == -1) done.fail();
                })

            //возврат профилей в прежнее состояние
            await _editProfile(userMe, me.id, me.jwtToken)
            await _editProfile(userOther, otherUser.id, otherUser.jwtToken)
            
            done();
        });

        it('/:id/subscribers (GET) subscribers of otherUser', async (done) => {
            const userMe = _deepCopyUser((await _getProfile(me.id, me.jwtToken)).body)
            const userOther = _deepCopyUser((await _getProfile(otherUser.id, otherUser.jwtToken)).body)
            
            await _subscribe(otherUser.id, me.jwtToken);
            await request(app.getHttpServer())
                .get('/' + otherUser.id + '/subscribers')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(200)
                .then(response => {
                    const users = response.body
                    const indx = users.findIndex(current => current._id  === me.id)
                    if (indx == -1) done.fail();
                })

            //возврат профилей в прежнее состояние
            await _editProfile(userMe, me.id, me.jwtToken)
            await _editProfile(userOther, otherUser.id, otherUser.jwtToken)
            
            done();
        });

        it('/:id/subscribers (GET) subscribers of otherUser with closed profile', async (done) => {
            const userOther = _deepCopyUser((await _getProfile(otherUser.id, otherUser.jwtToken)).body)

            const newUserOther = _deepCopyUser(userOther)
            newUserOther.profilePrivatType = profilePrivatType.closed
            await _editProfile(newUserOther, otherUser.id, otherUser.jwtToken)              
            
            await request(app.getHttpServer())
                .get('/' + otherUser.id + '/subscribers')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(403)

            //возврат профилей в прежнее состояние
            await _editProfile(userOther, otherUser.id, otherUser.jwtToken)

            done();
        });

        it('/:id/subscribers and /:id/subscriptions (GET) subscribers and subscriptions of otherUser with closed profile if your a subsriber', async (done) => {
            const userMe = _deepCopyUser((await _getProfile(me.id, me.jwtToken)).body)
            const userOther = _deepCopyUser((await _getProfile(otherUser.id, otherUser.jwtToken)).body)

            await _subscribe(otherUser.id, me.jwtToken)

            const newUserOther = _deepCopyUser((await _getProfile(otherUser.id, otherUser.jwtToken)).body)
            newUserOther.profilePrivatType = profilePrivatType.closed
            await _editProfile(newUserOther, otherUser.id, otherUser.jwtToken)              
            
            await request(app.getHttpServer())
                .get('/' + otherUser.id + '/subscribers')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(200)
            
            await request(app.getHttpServer())
                .get('/' + otherUser.id + '/subscriptions')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(200)

            //возврат профилей в прежнее состояние
            await _editProfile(userMe, me.id, me.jwtToken)
            await _editProfile(userOther, otherUser.id, otherUser.jwtToken)

            done();
        });

        it('/:id/subscriptions (GET) subscriptions of myself', async (done) => {
            const userMe = _deepCopyUser((await _getProfile(me.id, me.jwtToken)).body)
            const userOther = _deepCopyUser((await _getProfile(otherUser.id, otherUser.jwtToken)).body)
            
            await _subscribe(otherUser.id, me.jwtToken);
            await request(app.getHttpServer())
                .get('/' + me.id + '/subscriptions')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(200)
                .then(response => {
                    const users = response.body
                    const indx = users.findIndex(current => current._id  === otherUser.id)
                    if (indx == -1) done.fail();
                })

            //возврат профилей в прежнее состояние
            await _editProfile(userMe, me.id, me.jwtToken)
            await _editProfile(userOther, otherUser.id, otherUser.jwtToken)
            
            done();
        });

        it('/:id/subscriptions (GET) subscriptions of otherUser', async (done) => {
            const userMe = _deepCopyUser((await _getProfile(me.id, me.jwtToken)).body)
            const userOther = _deepCopyUser((await _getProfile(otherUser.id, otherUser.jwtToken)).body)
            
            await _subscribe(me.id, otherUser.jwtToken);
            await request(app.getHttpServer())
                .get('/' + otherUser.id + '/subscriptions')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(200)
                .then(response => {
                    const users = response.body
                    const indx = users.findIndex(current => current._id  === me.id)
                    if (indx == -1) done.fail();
                })

            //возврат профилей в прежнее состояние
            await _editProfile(userMe, me.id, me.jwtToken)
            await _editProfile(userOther, otherUser.id, otherUser.jwtToken)
            
            done();
        });

        it('/:id/subscriptions (GET) subscriptions of otherUser with closed profile', async (done) => {
            const userOther = _deepCopyUser((await _getProfile(otherUser.id, otherUser.jwtToken)).body)

            const newUserOther = _deepCopyUser(userOther)
            newUserOther.profilePrivatType = profilePrivatType.closed
            await _editProfile(newUserOther, otherUser.id, otherUser.jwtToken)              
            
            await request(app.getHttpServer())
                .get('/' + otherUser.id + '/subscriptions')
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .expect(403)

            //возврат профилей в прежнее состояние
            await _editProfile(userOther, otherUser.id, otherUser.jwtToken)

            done();
        });

    });
   
    afterEach(async () => {
        await app.close();
    });
});
