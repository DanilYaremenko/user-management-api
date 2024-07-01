import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [TokenModule],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
