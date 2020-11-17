import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { UserService } from './user/user.service';

describe('AppController', () => {
    let appController: AppController;
    let userService: UserService;

    // beforeEach(async () => {
    //     const moduleRef = await Test.createTestingModule({
    //         controllers: [AppController],
    //         // providers: [UserService],
    //     })
    //         .overrideProvider(UserService)
    //         .useValue({})
    //         .compile();

    //     // userService = moduleRef.get<UserService>(UserService);
    //     // appController = moduleRef.get<AppController>(AppController);
    // });

    // describe('getHello', () => {
    //     it('should return "hello"', async () => {
    //         expect(appController.getHello()).toBe('hello')
    //     })
    // })
});