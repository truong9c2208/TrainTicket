import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  readonly client: Redis;

  constructor(configService: ConfigService) {
    const url = configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
    this.client = new Redis(url);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
