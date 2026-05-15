import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';

const SPIN_COOLDOWN_SECONDS = 86400; // 1 spin per session per day

// Default probability table (probabilities must sum to 1.0)
const DEFAULT_SPIN_PROBABILITIES: Array<{
  type: string;
  probability: number;
  label: string;
  value?: string;
}> = [
  { type: 'free_shipping',  probability: 0.30, label: '🚚 Free Shipping!' },
  { type: 'discount_code',  probability: 0.25, label: '10% Off Your Order', value: '10' },
  { type: 'free_tiny_gift', probability: 0.20, label: '🎁 Free Tiny Gift!' },
  { type: 'hidden_item',    probability: 0.10, label: '✨ Secret Surprise Item' },
  { type: 'upgraded_gift',  probability: 0.05, label: '⬆️ Upgraded Gift' },
  { type: 'no_reward',      probability: 0.10, label: 'Better luck next time!' },
];

@Injectable()
export class SpinService {
  private readonly logger = new Logger(SpinService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async spin(sessionToken: string): Promise<{
    reward: { type: string; label: string; value?: string | null };
    alreadySpun: boolean;
  }> {
    // Check if session already spun
    const cooldownKey = `spin:${sessionToken}`;
    const alreadySpun = await this.redis.exists(cooldownKey);
    if (alreadySpun) {
      return { reward: await this.getExistingReward(sessionToken), alreadySpun: true };
    }

    // Verify the box exists and is complete
    const box = await this.prisma.giftBox.findUnique({
      where: { sessionToken },
      include: { spinReward: true },
    });

    if (!box) throw new NotFoundException('Box session not found');
    if (box.status === 'BUILDING') {
      throw new BadRequestException('Complete your box selections before spinning');
    }
    if (box.spinReward) {
      return { reward: box.spinReward, alreadySpun: true };
    }

    // Load probability config from DB (falls back to defaults)
    const config = await this.getSpinConfig();

    // Server-side weighted random selection — never exposed to client
    const reward = this.weightedRandom(config);

    // Persist the reward
    const created = await this.prisma.spinReward.create({
      data: {
        type: reward.type as any,
        label: reward.label,
        value: reward.value ?? null,
      },
    });

    await this.prisma.giftBox.update({
      where: { sessionToken },
      data: { spinRewardId: created.id },
    });

    // Mark cooldown
    await this.redis.set(cooldownKey, '1', SPIN_COOLDOWN_SECONDS);

    this.logger.log(`Spin result for ${sessionToken}: ${reward.type}`);

    return { reward: created, alreadySpun: false };
  }

  private async getExistingReward(sessionToken: string) {
    const box = await this.prisma.giftBox.findUnique({
      where: { sessionToken },
      include: { spinReward: true },
    });
    return box?.spinReward ?? { type: 'no_reward', label: 'No reward', value: null };
  }

  private async getSpinConfig() {
    const dbConfig = await this.prisma.spinConfig.findMany({ where: { active: true } });
    if (dbConfig.length === 0) return DEFAULT_SPIN_PROBABILITIES;

    return dbConfig.map((c) => ({
      type: c.rewardType,
      probability: c.probability,
      label: c.label,
      value: undefined as string | undefined,
    }));
  }

  private weightedRandom(
    options: Array<{ type: string; probability: number; label: string; value?: string }>,
  ) {
    const rand = Math.random();
    let cumulative = 0;

    for (const option of options) {
      cumulative += option.probability;
      if (rand <= cumulative) return option;
    }

    return options[options.length - 1];
  }

  async getConfig() {
    const dbConfig = await this.prisma.spinConfig.findMany();
    if (dbConfig.length > 0) return dbConfig;
    return DEFAULT_SPIN_PROBABILITIES;
  }

  async updateConfig(
    configs: Array<{ rewardType: string; probability: number; label: string; active: boolean }>,
  ) {
    const total = configs.reduce((sum, c) => sum + c.probability, 0);
    if (Math.abs(total - 1.0) > 0.001) {
      throw new BadRequestException('Probabilities must sum to 1.0');
    }

    const results = await Promise.all(
      configs.map((c) =>
        this.prisma.spinConfig.upsert({
          where: { rewardType: c.rewardType as any },
          create: {
            rewardType: c.rewardType as any,
            probability: c.probability,
            label: c.label,
            active: c.active,
          },
          update: {
            probability: c.probability,
            label: c.label,
            active: c.active,
          },
        }),
      ),
    );

    return results;
  }
}
