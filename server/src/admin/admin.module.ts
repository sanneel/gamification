import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../common/prisma.service';
import { SpinService } from '../spin/spin.service';
import { RedisService } from '../common/redis.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PrismaService, SpinService, RedisService],
})
export class AdminModule {}
