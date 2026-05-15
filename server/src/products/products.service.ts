import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { SyncProductDto, SyncProductsBatchDto } from './dto/sync-products.dto';
import { Prisma } from '@prisma/client';

const PRODUCTS_CACHE_KEY = 'products:all';
const PRODUCTS_CACHE_TTL = 300; // 5 minutes

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findAll(filters?: {
    category?: string;
    audience?: string;
    vibes?: string[];
    active?: boolean;
  }) {
    const cacheKey = filters
      ? `products:filtered:${JSON.stringify(filters)}`
      : PRODUCTS_CACHE_KEY;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const where: Prisma.ProductWhereInput = {
      active: filters?.active !== undefined ? filters.active : true,
    };

    if (filters?.category) {
      where.category = filters.category as any;
    }
    if (filters?.audience) {
      where.audience = filters.audience as any;
    }
    if (filters?.vibes?.length) {
      where.vibes = { hasSome: filters.vibes as any[] };
    }

    const products = await this.prisma.product.findMany({
      where,
      orderBy: [{ category: 'asc' }, { title: 'asc' }],
    });

    await this.redis.set(cacheKey, JSON.stringify(products), PRODUCTS_CACHE_TTL);
    return products;
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async syncBatch(dto: SyncProductsBatchDto) {
    const results = { synced: 0, errors: [] as string[] };

    for (const item of dto.products) {
      try {
        await this.upsertProduct(item);
        results.synced++;
      } catch (err) {
        this.logger.error(`Sync error for ${item.externalId}: ${err.message}`);
        results.errors.push(`${item.externalId}: ${err.message}`);
      }
    }

    await this.prisma.productSyncLog.create({
      data: {
        source: 'api_sync',
        totalSynced: results.synced,
        errors: results.errors,
      },
    });

    await this.invalidateCache();
    return results;
  }

  async upsertProduct(dto: SyncProductDto) {
    const data = {
      title: dto.title,
      description: dto.description,
      normalPrice: dto.normalPrice,
      boxPrice: dto.boxPrice,
      images: dto.images,
      stock: dto.stock,
      active: dto.active ?? true,
      category: dto.category as any,
      audience: dto.audience as any ?? 'neutral',
      vibes: dto.vibes as any[] ?? [],
      tags: dto.tags ?? [],
    };

    return this.prisma.product.upsert({
      where: { externalId: dto.externalId },
      create: { ...data, externalId: dto.externalId },
      update: data,
    });
  }

  async updateStock(externalId: string, stock: number) {
    const product = await this.prisma.product.findUnique({ where: { externalId } });
    if (!product) throw new NotFoundException(`Product with externalId ${externalId} not found`);

    const updated = await this.prisma.product.update({
      where: { externalId },
      data: { stock, active: stock > 0 },
    });

    await this.invalidateCache();
    return updated;
  }

  async findByCategory(category: string) {
    return this.prisma.product.findMany({
      where: { category: category as any, active: true, stock: { gt: 0 } },
      orderBy: { title: 'asc' },
    });
  }

  private async invalidateCache() {
    await this.redis.del(PRODUCTS_CACHE_KEY);
    // Could also use pattern-based deletion for filtered keys
  }
}
