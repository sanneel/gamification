import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { SpinService } from './spin.service';

class SpinDto {
  @IsString()
  sessionToken: string;
}

@ApiTags('spin')
@Controller('spin')
export class SpinController {
  constructor(private readonly spinService: SpinService) {}

  @Post()
  @ApiOperation({ summary: 'Execute a server-side weighted spin for a completed box' })
  spin(@Body() dto: SpinDto) {
    return this.spinService.spin(dto.sessionToken);
  }
}
