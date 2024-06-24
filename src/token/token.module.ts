import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JWT_TTL } from '../common/constants';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { RedisOptions } from 'ioredis';

@Module({
  imports: [
    CacheModule.registerAsync<RedisOptions>({
      useFactory: (configService: ConfigService) => {
        const redisUrl = new URL(configService.get('REDIS_URL'));

        return {
          store: redisStore,
          host: redisUrl.hostname,
          port: Number(redisUrl.port),
          password: redisUrl.password,
          ttl: JWT_TTL / 1000,
        };
      },
      inject: [ConfigService],
    }),

    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: `${JWT_TTL}ms` },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [TokenService],
  controllers: [TokenController],
  exports: [TokenService],
})
export class TokenModule {}
