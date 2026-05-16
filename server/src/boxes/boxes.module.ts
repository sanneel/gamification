import { Module } from '@nestjs/common';
import { BoxesController } from './boxes.controller';
import { BoxesService } from './boxes.service';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';

@Module({
  controllers: [BoxesController],
  providers: [BoxesService, PrismaService, RedisService],
  exports: [BoxesService],
})
export class BoxesModule {}
