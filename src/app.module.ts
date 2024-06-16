import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PositionsModule } from './positions/positions.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    PositionsModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
