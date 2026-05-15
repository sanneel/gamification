import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService, RedisService],
  exports: [ProductsService],
})
export class ProductsModule {}
