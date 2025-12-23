// **** Library Imports ****
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Post, Body, Controller, UseGuards } from '@nestjs/common';

// **** External Imports ****
import { Role } from '@common/enums/userRole';
import { Roles } from '@common/decorators/roles.decorator';
import { InActiveUserGuard } from '@common/guards/inActiveUser.guard';
import { SupabaseAuthGuard } from '@common/guards/supabase-auth.guard';

// **** Internal Imports ****
import { CreateOpenAICallLog } from '../dto/create-open-ai-call-log.dto';
import { LogsAndTracksService } from '../services/logs-and-tracks.service';

@Controller('logs-and-tracks')
export class LogsAndTracksController {
  constructor(private readonly logsAndTracksService: LogsAndTracksService) {}

  @Post('/open-ai-call')
  @ApiOperation({ summary: 'Create a new OpenAI call log' })
  @Roles([Role.INSTITUTE_ADMIN, Role.INSTRUCTOR, Role.STUDENT])
  @ApiBearerAuth('access-token')
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard)
  createOpenAICallLog(@Body() createLogsAndTrackDto: CreateOpenAICallLog) {
    return this.logsAndTracksService.createOpenAICallLog(createLogsAndTrackDto);
  }
}
