import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  Request,
  UsePipes,
  UseGuards,
  Controller,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiBearerAuth, ApiTags, ApiBody } from '@nestjs/swagger';

import { Role } from '@common/enums/userRole';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { InActiveUserGuard } from '@common/guards/inActiveUser.guard';
import { SupabaseAuthGuard } from '@common/guards/supabase-auth.guard';

import { MarkNotificationsDto } from '../dto/mark-notification.dto';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { NotificationJobsService } from '../services/notificationJobs.service';
import { UserNotificationsService } from '../services/userNotifications.service';
import { PaginationDTO } from '@common/dto/pagination.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationJobsService,
    private readonly userNotificationsService: UserNotificationsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create notification Job' })
  @Roles([Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @Roles([Role.SUPER_ADMIN, Role.INSTRUCTOR, Role.STUDENT])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  findAll(@Request() req, @Query() query: PaginationDTO) {
    const { role, id } = req.user;
    const { page, limit, sortBy, sortOrder } = query;
    if (role === Role.SUPER_ADMIN) {
      return this.notificationsService.findAll(
        undefined,
        page,
        limit,
        sortBy,
        sortOrder,
      );
    }
    return this.userNotificationsService.findAll(
      { userId: id },
      page,
      limit,
      sortBy,
      sortOrder,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification details' })
  @Roles([Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne({ id });
  }

  /**
   * Mark multiple user notifications as seen.
   * If a notification has no linkUrl, it will also be marked as read.
   */
  @Patch('seen')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true })) // Enables automatic transformation and validation
  @ApiOperation({ summary: 'Mark notification as seen' })
  @Roles([Role.INSTRUCTOR, Role.STUDENT])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBody({ type: MarkNotificationsDto })
  @ApiBearerAuth('access-token')
  async markAsSeen(@Body() body: MarkNotificationsDto): Promise<boolean> {
    return this.userNotificationsService.markAsSeen(body.notificationIds);
  }

  /**
   * Mark a single user notification as read.
   */
  @Patch('read/:id')
  @ApiOperation({ summary: 'Mark notification as read' })
  @Roles([Role.INSTRUCTOR, Role.STUDENT])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async markAsRead(@Param('id') notificationId: string) {
    return await this.userNotificationsService.markAsRead(notificationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Get notification details' })
  @Roles([Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Mark notification as seen' })
  @Roles([Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}
