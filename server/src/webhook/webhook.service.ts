import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-11-20.acacia',
    });
  }

  async handleStripeEvent(rawBody: Buffer, signature: string) {
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!secret) {
      this.logger.warn('STRIPE_WEBHOOK_SECRET not configured');
      return { received: true };
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch (err) {
      this.logger.error(`Webhook signature error: ${err.message}`);
      throw err;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const sessionToken = session.metadata?.boxSessionToken;
      if (sessionToken) {
        await this.prisma.giftBox.updateMany({
          where: { sessionToken },
          data: { status: 'PAID', stripeSessionId: session.id },
        });
        this.logger.log(`Box paid: ${sessionToken}`);
      }
    }

    // Handle product inventory webhook from backoffice
    if (event.type === 'product.updated' as any) {
      this.logger.log('Product update webhook received');
    }

    return { received: true };
  }

  async handleProductSyncWebhook(payload: {
    externalId: string;
    stock?: number;
    active?: boolean;
    normalPrice?: number;
    boxPrice?: number;
  }) {
    const product = await this.prisma.product.findUnique({
      where: { externalId: payload.externalId },
    });

    if (!product) {
      this.logger.warn(`Webhook: unknown externalId ${payload.externalId}`);
      return { ignored: true };
    }

    const data: Record<string, unknown> = {};
    if (payload.stock !== undefined) data.stock = payload.stock;
    if (payload.active !== undefined) data.active = payload.active;
    if (payload.normalPrice !== undefined) data.normalPrice = payload.normalPrice;
    if (payload.boxPrice !== undefined) data.boxPrice = payload.boxPrice;

    const updated = await this.prisma.product.update({
      where: { externalId: payload.externalId },
      data,
    });

    this.logger.log(`Webhook sync: updated product ${payload.externalId}`);
    return { updated };
  }
}
