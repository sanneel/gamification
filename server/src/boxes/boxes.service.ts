import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { UpdateBoxDto } from './dto/box.dto';

const CATEGORY_SLOT: Record<string, 'mainSurpriseId' | 'sweetPickId' | 'tinyExtraId'> = {
  main_surprise: 'mainSurpriseId',
  sweet_pick: 'sweetPickId',
  tiny_extra: 'tinyExtraId',
};

@Injectable()
export class BoxesService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async create() {
    const box = await this.prisma.giftBox.create({ data: {} });
    await this.redis.set(`box:${box.sessionToken}`, JSON.stringify(box), 86400);
    return box;
  }

  async findByToken(sessionToken: string) {
    const cached = await this.redis.get(`box:${sessionToken}`);
    if (cached) return JSON.parse(cached);

    const box = await this.prisma.giftBox.findUnique({
      where: { sessionToken },
      include: {
        mainSurprise: true,
        sweetPick: true,
        tinyExtra: true,
        spinReward: true,
      },
    });
    if (!box) throw new NotFoundException('Box session not found');
    await this.redis.set(`box:${sessionToken}`, JSON.stringify(box), 3600);
    return box;
  }

  async update(sessionToken: string, dto: UpdateBoxDto) {
    const box = await this.prisma.giftBox.findUnique({ where: { sessionToken } });
    if (!box) throw new NotFoundException('Box session not found');
    if (box.status === 'PAID') throw new BadRequestException('Cannot modify a paid box');

    const updateData: Record<string, string | null> = {};

    // Validate each product slot and enforce category constraints
    const slotFields = [
      { field: 'mainSurpriseId', value: dto.mainSurpriseId, expected: 'main_surprise' },
      { field: 'sweetPickId', value: dto.sweetPickId, expected: 'sweet_pick' },
      { field: 'tinyExtraId', value: dto.tinyExtraId, expected: 'tiny_extra' },
    ];

    for (const slot of slotFields) {
      if (slot.value !== undefined) {
        if (slot.value === null) {
          updateData[slot.field] = null;
        } else {
          const product = await this.prisma.product.findUnique({
            where: { id: slot.value },
          });
          if (!product) throw new NotFoundException(`Product ${slot.value} not found`);
          if (product.category !== slot.expected) {
            throw new BadRequestException(
              `Product "${product.title}" belongs to category "${product.category}", expected "${slot.expected}"`,
            );
          }
          if (!product.active || product.stock < 1) {
            throw new BadRequestException(`Product "${product.title}" is not available`);
          }
          updateData[slot.field] = slot.value;
        }
      }
    }

    const allComplete =
      (updateData.mainSurpriseId ?? box.mainSurpriseId) &&
      (updateData.sweetPickId ?? box.sweetPickId) &&
      (updateData.tinyExtraId ?? box.tinyExtraId);

    const updated = await this.prisma.giftBox.update({
      where: { sessionToken },
      data: {
        ...updateData,
        status: allComplete ? 'COMPLETE' : 'BUILDING',
      },
      include: {
        mainSurprise: true,
        sweetPick: true,
        tinyExtra: true,
        spinReward: true,
      },
    });

    await this.redis.set(`box:${sessionToken}`, JSON.stringify(updated), 3600);
    return updated;
  }

  calculateTotal(box: {
    mainSurprise?: { boxPrice: number } | null;
    sweetPick?: { boxPrice: number } | null;
    tinyExtra?: { boxPrice: number } | null;
    spinReward?: { type: string; value: string | null } | null;
  }) {
    const base =
      (box.mainSurprise?.boxPrice ?? 0) +
      (box.sweetPick?.boxPrice ?? 0) +
      (box.tinyExtra?.boxPrice ?? 0);

    let discount = 0;
    const reward = box.spinReward;
    if (reward) {
      if (reward.type === 'free_shipping') {
        discount = 500; // 5 GEL shipping
      } else if (reward.type === 'discount_code' && reward.value) {
        const pct = parseFloat(reward.value);
        if (!isNaN(pct)) discount = Math.round(base * (pct / 100));
      } else if (reward.type === 'free_tiny_gift') {
        discount = box.tinyExtra?.boxPrice ?? 0;
      }
    }

    return {
      subtotal: base,
      discount,
      shipping: reward?.type === 'free_shipping' ? 0 : 500,
      total: base - discount + (reward?.type === 'free_shipping' ? 0 : 500),
    };
  }
}
