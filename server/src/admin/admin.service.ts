import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAnalytics() {
    const [
      totalBoxes,
      paidBoxes,
      totalProducts,
      activeProducts,
      rewardBreakdown,
      recentBoxes,
    ] = await Promise.all([
      this.prisma.giftBox.count(),
      this.prisma.giftBox.count({ where: { status: 'PAID' } }),
      this.prisma.product.count(),
      this.prisma.product.count({ where: { active: true } }),
      this.prisma.spinReward.groupBy({
        by: ['type'],
        _count: { type: true },
        orderBy: { _count: { type: 'desc' } },
      }),
      this.prisma.giftBox.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          mainSurprise: { select: { title: true } },
          sweetPick: { select: { title: true } },
          tinyExtra: { select: { title: true } },
          spinReward: { select: { type: true, label: true } },
        },
      }),
    ]);

    const conversionRate = totalBoxes > 0
      ? Math.round((paidBoxes / totalBoxes) * 100)
      : 0;

    return {
      overview: {
        totalBoxes,
        paidBoxes,
        conversionRate,
        totalProducts,
        activeProducts,
      },
      rewardBreakdown,
      recentBoxes,
    };
  }

  async getSyncLogs(limit = 20) {
    return this.prisma.productSyncLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}
