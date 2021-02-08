import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { configModule } from 'src/configure.root';
import { UserDto } from 'src/user/dto/user.dto';
import { profilePrivatType } from 'src/user/enum/profile-privet-type.enum';
import { meUserTestData, otherUserTestData } from './data';

process.setMaxListeners(100);

describe('UserController (e2e)', () => {
    let app: INestApplication;
    const me = meUserTestData;
    const otherUser = otherUserTestData;

    const nonExistenId = '5fae59d7c4a4f05a98e23377'
    
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

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [configModule, AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    describe('get profile', () => {

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
            await request(app.getHttpServer())
                .get('/' + nonExistenId)
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

    describe('edit profile', () => {

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

            return await request(app.getHttpServer())
                .put('/' + otherUser.id)
                .set('Authorization', 'Bearer ' + me.jwtToken)
                .send(userDto)
                .set('Accept', 'application/json')
                .expect(400)
        })
    })

    afterAll(async () => {
        await app.close();
    });
});
