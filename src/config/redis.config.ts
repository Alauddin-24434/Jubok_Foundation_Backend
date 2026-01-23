import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

export const getRedisClient = (configService: ConfigService): Redis => {
  return new Redis({
    host: configService.get<string>('REDIS_HOST'),
    port: configService.get<number>('REDIS_PORT'),
    password: configService.get<string>('REDIS_PASSWORD') || undefined,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
  });
};
