import {
  Body,
  Controller,
  Headers,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { WebhookService } from './webhook.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('stripe')
  @ApiOperation({ summary: 'Stripe payment webhook' })
  handleStripe(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ) {
    return this.webhookService.handleStripeEvent(req.rawBody!, sig);
  }

  @Post('product-sync')
  @ApiOperation({ summary: 'Backoffice product sync webhook' })
  handleProductSync(
    @Body()
    payload: {
      externalId: string;
      stock?: number;
      active?: boolean;
      normalPrice?: number;
      boxPrice?: number;
    },
  ) {
    return this.webhookService.handleProductSyncWebhook(payload);
  }
}
