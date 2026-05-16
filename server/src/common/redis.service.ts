import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;

  constructor(private config: ConfigService) {
    const redisUrl = this.config.get<string>('REDIS_URL');
    if (redisUrl) {
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });
      this.client.on('error', (err) => {
        this.logger.warn(`Redis connection error: ${err.message}`);
      });
    } else {
      this.logger.warn('REDIS_URL not set — Redis features disabled');
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client) return;
    try {
      if (ttlSeconds) {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch {
      // silently fail — Redis is not critical
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.del(key);
    } catch {}
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client) return false;
    try {
      return (await this.client.exists(key)) === 1;
    } catch {
      return false;
    }
  }

  async incr(key: string): Promise<number> {
    if (!this.client) return 0;
    try {
      return await this.client.incr(key);
    } catch {
      return 0;
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.expire(key, ttlSeconds);
    } catch {}
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }
}
