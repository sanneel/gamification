import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { SyncProductDto, SyncProductsBatchDto } from './dto/sync-products.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List all active products with optional filters' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'audience', required: false })
  @ApiQuery({ name: 'vibes', required: false, isArray: true })
  findAll(
    @Query('category') category?: string,
    @Query('audience') audience?: string,
    @Query('vibes') vibes?: string | string[],
  ) {
    const vibesArr = vibes ? (Array.isArray(vibes) ? vibes : [vibes]) : undefined;
    return this.productsService.findAll({ category, audience, vibes: vibesArr, active: true });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single product by ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync products from external backoffice (batch upsert)' })
  syncBatch(@Body() dto: SyncProductsBatchDto) {
    return this.productsService.syncBatch(dto);
  }

  @Put('sync/:externalId/stock')
  @ApiOperation({ summary: 'Update stock for a product by external ID' })
  updateStock(
    @Param('externalId') externalId: string,
    @Body('stock') stock: number,
  ) {
    return this.productsService.updateStock(externalId, stock);
  }
}
