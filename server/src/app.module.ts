import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ProductsModule } from './products/products.module';
import { BoxesModule } from './boxes/boxes.module';
import { SpinModule } from './spin/spin.module';
import { AdminModule } from './admin/admin.module';
import { WebhookModule } from './webhook/webhook.module';
import { PrismaService } from './common/prisma.service';
import { RedisService } from './common/redis.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    ProductsModule,
    BoxesModule,
    SpinModule,
    AdminModule,
    WebhookModule,
  ],
  providers: [PrismaService, RedisService],
  exports: [PrismaService, RedisService],
})
export class AppModule {}
