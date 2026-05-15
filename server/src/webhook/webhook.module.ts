import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [WebhookController],
  providers: [WebhookService, PrismaService],
})
export class WebhookModule {}
