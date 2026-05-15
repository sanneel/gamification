import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BoxesService } from './boxes.service';
import { UpdateBoxDto } from './dto/box.dto';

@ApiTags('boxes')
@Controller('boxes')
export class BoxesController {
  constructor(private readonly boxesService: BoxesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new empty gift box session' })
  create() {
    return this.boxesService.create();
  }

  @Get(':token')
  @ApiOperation({ summary: 'Get box by session token' })
  findOne(@Param('token') token: string) {
    return this.boxesService.findByToken(token);
  }

  @Patch(':token')
  @ApiOperation({ summary: 'Update box item selections' })
  update(@Param('token') token: string, @Body() dto: UpdateBoxDto) {
    return this.boxesService.update(token, dto);
  }

  @Get(':token/total')
  @ApiOperation({ summary: 'Get total price breakdown for a box' })
  async total(@Param('token') token: string) {
    const box = await this.boxesService.findByToken(token);
    return this.boxesService.calculateTotal(box);
  }
}
