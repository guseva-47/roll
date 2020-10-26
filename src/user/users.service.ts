import { Injectable } from '@nestjs/common';

export type User = any; // todo вот здесь должен быть интерфейс, да??

@Injectable()
export class UsersService {
  private readonly users: User[];

  constructor() {
    this.users = [
      {
        userId: 1,
        username: 'john',
        password: 'changeme',
        bla: 'john blabla'
      },
      {
        userId: 2,
        username: 'chris',
        password: 'secret',
        bla: 'chris blabla'
      },
      {
        userId: 3,
        username: 'maria',
        password: 'guess',
        bla: 'maria blabla'
      },
    ];
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
}
