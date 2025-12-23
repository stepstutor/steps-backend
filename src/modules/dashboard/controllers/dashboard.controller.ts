import {
  ApiTags,
  ApiQuery,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Controller, Query, Request, UseGuards } from '@nestjs/common';
import { Get } from '@nestjs/common';

import { Role } from '@common/enums/userRole';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { InActiveUserGuard } from '@common/guards/inActiveUser.guard';
import { SupabaseAuthGuard } from '@common/guards/supabase-auth.guard';
import { LogsAndTracksService } from '@modules/logs-and-tracks/services/logs-and-tracks.service';

import { DashboardStatsDto } from '../types/dashboard-stats.dto';
import { DashboardService } from '../dashboard.service';

@Controller('dashboard')
@ApiTags('Dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly logsAndTracksService: LogsAndTracksService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of dashboard statistics.',
    type: DashboardStatsDto,
  })
  @Roles([Role.INSTITUTE_ADMIN, Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async getDashboardStats(@Request() req): Promise<DashboardStatsDto> {
    const { role } = req.user;
    if (role === Role.SUPER_ADMIN) {
      return await this.dashboardService.getDashboardStats();
    } else {
      const { institutionId: authenticatedInstitutionId } = req.user;
      return await this.dashboardService.getDashboardStats(
        authenticatedInstitutionId,
      );
    }
  }

  @Get('open-ai-calls')
  @ApiOperation({ summary: 'Get OpenAI call logs' })
  @Roles([Role.SUPER_ADMIN])
  @ApiBearerAuth('access-token')
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard)
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  findAll(@Query() query: { startDate?: string; endDate?: string }) {
    const { startDate, endDate } = query;
    return this.logsAndTracksService.getOpenAICallStats(startDate, endDate);
  }
}
