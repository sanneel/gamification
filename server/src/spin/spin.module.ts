import { Module } from '@nestjs/common';
import { SpinController } from './spin.controller';
import { SpinService } from './spin.service';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';

@Module({
  controllers: [SpinController],
  providers: [SpinService, PrismaService, RedisService],
  exports: [SpinService],
})
export class SpinModule {}
