import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user/users.module';
import { AppController } from './app.controller';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [AppController]
})
export class AppModule {}
