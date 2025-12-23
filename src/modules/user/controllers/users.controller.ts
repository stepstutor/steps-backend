// **** Library Imports ****
import {
  Get,
  Put,
  Body,
  Post,
  Param,
  Query,
  Delete,
  Request,
  UseGuards,
  Controller,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiTags,
  ApiConsumes,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { In } from 'typeorm';
import * as crypto from 'crypto';
import { FileInterceptor } from '@nestjs/platform-express';

// **** External Imports ****
import { Role } from '@common/enums/userRole';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { InActiveUserGuard } from '@common/guards/inActiveUser.guard';
import { SupabaseAuthGuard } from '@common/guards/supabase-auth.guard';

// **** Internal Imports ****
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dtos/updateUserDto';
import { CreateUserDto } from '../dtos/createUserDto';
import { ArchiveUsersDto } from '../dtos/archiveUsersDto';
import { QueryParamsUsersDto } from '../dtos/queryParamsUsersDto';
import { UsersManagerService } from '../services/users.manager.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersManagerService: UsersManagerService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get users' })
  @Roles([Role.INSTITUTE_ADMIN, Role.INSTRUCTOR])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  get(@Request() req, @Query() params: QueryParamsUsersDto) {
    const { institutionId } = req.user;
    return this.usersManagerService.getUsers(institutionId, params);
  }

  @Get('/usage')
  @ApiOperation({ summary: 'Get users quota' })
  @Roles([Role.INSTITUTE_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async getUsersUsage(@Request() req) {
    const { institutionId } = req.user;
    return this.usersManagerService.getUsersUsage(institutionId);
  }

  @Post()
  @ApiOperation({ summary: 'Add users' })
  @Roles([Role.INSTITUTE_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @ApiBody({ type: [CreateUserDto] })
  async create(@Request() req, @Body() usersBody: CreateUserDto[]) {
    const { id: authenticatedUserId, institutionId } = req.user;
    return this.usersManagerService.createUsers(
      authenticatedUserId,
      institutionId,
      usersBody,
    );
  }

  @Put('/profile')
  @ApiOperation({ summary: 'Update authenticated user profile' })
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard)
  @UseInterceptors(FileInterceptor('profilePic'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', nullable: true },
        lastName: { type: 'string', nullable: true },
        profilePic: { type: 'string', format: 'binary', nullable: true },
      },
    },
  })
  updateProfile(
    @Request() req,
    @Body() updateUserBody: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { id: authenticatedUserId } = req.user;

    return this.usersService.updateProfile(
      authenticatedUserId,
      updateUserBody,
      file,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @Roles([Role.INSTITUTE_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateUserBody: UpdateUserDto,
  ) {
    const { id: authenticatedUserId, institutionId } = req.user;
    return this.usersService.update(
      {
        ...updateUserBody,
        updatedBy: authenticatedUserId,
      },
      { institutionId, id, role: In([Role.INSTRUCTOR, Role.STUDENT]) },
    );
  }

  @Put(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive user' })
  @Roles([Role.INSTITUTE_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async unarchive(@Param('id') id: crypto.UUID, @Request() req) {
    const { id: authenticatedUserId, institutionId } = req.user;

    return this.usersManagerService.unarchiveUser(
      id,
      authenticatedUserId,
      institutionId,
    );
  }

  @Get('/profile')
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('access-token')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('/update-password')
  @ApiOperation({ summary: 'Update authenticated user password' })
  @ApiBearerAuth('access-token')
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        password: { type: 'string' },
      },
    },
  })
  updatePassword(@Body() updateUserBody: { password: string }) {
    return this.usersService.updatePassword(updateUserBody);
  }

  @Post('/resend-invite/:id')
  @ApiOperation({ summary: 'Resend invitation email' })
  @Roles([Role.INSTITUTE_ADMIN, Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async resendInvite(@Param('id') userId: string) {
    return this.usersService.resendInvite(userId);
  }

  @Post('/archive-users')
  @ApiOperation({ summary: 'Resend invitation email' })
  @Roles([Role.INSTITUTE_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async archiveUsers(@Body() body: ArchiveUsersDto) {
    return this.usersService.archiveUsers(body.ids);
  }

  @Delete('/delete-invitation/:id')
  @ApiOperation({ summary: 'Delete user invitation' })
  @Roles([Role.INSTITUTE_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async deleteInvitation(@Param('id') id: string, @Request() req) {
    const { institutionId } = req.user;
    return this.usersService.deleteInvitation(id, institutionId);
  }
}
