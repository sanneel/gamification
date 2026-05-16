import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { SpinService } from '../spin/spin.service';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly spinService: SpinService,
  ) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Get platform analytics overview' })
  getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Get('spin-config')
  @ApiOperation({ summary: 'Get current spin probability configuration' })
  getSpinConfig() {
    return this.spinService.getConfig();
  }

  @Put('spin-config')
  @ApiOperation({ summary: 'Update spin probability configuration' })
  updateSpinConfig(
    @Body()
    body: Array<{
      rewardType: string;
      probability: number;
      label: string;
      active: boolean;
    }>,
  ) {
    return this.spinService.updateConfig(body);
  }

  @Get('sync-logs')
  @ApiOperation({ summary: 'Get product sync history' })
  getSyncLogs(@Query('limit') limit?: number) {
    return this.adminService.getSyncLogs(limit);
  }
}
