import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RedisService } from './redis.service';

@Injectable()
export class LockService {
  constructor(private readonly redisService: RedisService) {}

  async withLock<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
    const token = randomUUID();
    const acquired = await this.redisService.client.set(key, token, 'PX', ttlMs, 'NX');

    if (!acquired) {
      throw new ServiceUnavailableException('Resource is busy, retry shortly');
    }

    try {
      return await fn();
    } finally {
      const releaseScript = `
        if redis.call('get', KEYS[1]) == ARGV[1] then
          return redis.call('del', KEYS[1])
        else
          return 0
        end
      `;
      await this.redisService.client.eval(releaseScript, 1, key, token);
    }
  }
}
