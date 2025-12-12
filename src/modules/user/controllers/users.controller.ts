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
  Response,
  UseGuards,
  Controller,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiTags,
  ApiConsumes,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { In } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';

// **** External Imports ****
import { Role } from '@common/enums/userRole';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { EmailService } from '@common/services/email.service';
import { InActiveUserGuard } from '@common/guards/inActiveUser.guard';
import { SupabaseAuthGuard } from '@common/guards/supabase-auth.guard';
import { InstitutionsService } from '@modules/institutions/institutions.service';

// **** Internal Imports ****
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dtos/updateUserDto';
import { CreateUserDto } from '../dtos/createUserDto';
import { ArchiveUsersDto } from '../dtos/archiveUsersDto';
import { QueryParamsUsersDto } from '../dtos/queryParamsUsersDto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly institutionService: InstitutionsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get users' })
  @Roles([Role.INSTITUTE_ADMIN, Role.INSTRUCTOR])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  get(@Request() req, @Query() params: QueryParamsUsersDto) {
    const { institutionId } = req.user;
    return this.usersService.findAllCustom({ ...params, institutionId });
  }

  @Get('/usage')
  @ApiOperation({ summary: 'Get users quota' })
  @Roles([Role.INSTITUTE_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async getUsersUsage(@Request() req) {
    const { institutionId } = req.user;
    return this.usersService.getUsersUsage(institutionId);
  }

  @Post()
  @ApiOperation({ summary: 'Add users' })
  @Roles([Role.INSTITUTE_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @ApiBody({ type: [CreateUserDto] })
  async create(
    @Request() req,
    @Response() res,
    @Body() usersBody: CreateUserDto[],
  ) {
    const { id: authenticatedUserId, institutionId } = req.user;
    const role = usersBody[0].role;
    const institution = await this.institutionService.findOne({
      id: institutionId,
    });
    const usage = await this.usersService.getUsersUsage(institutionId);
    const limit =
      (role === Role.INSTRUCTOR
        ? usage.instructors.limit
        : usage.students.limit) || 0;
    const consumedCount =
      role === Role.INSTRUCTOR
        ? usage.instructors.consumed
        : usage.students.consumed;

    if (consumedCount + usersBody.length > limit) {
      throw new BadRequestException('You have reached the limit of accounts');
    }
    const users = await this.usersService.addBulk(
      usersBody.map((user) => ({
        ...user,
        isActive: false,
        createdBy: authenticatedUserId,
        updatedBy: authenticatedUserId,
        institutionId: institutionId,
      })),
    );

    res.status(201).json(users);
    for (const user of users) {
      await this.emailService.sendInvitationEmail(
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.invitationLink!,
        institution?.language,
      );
      await new Promise((resolve) => setTimeout(resolve, 1500)); // 2 second delay
    }
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
  async unarchive(@Param('id') id: string, @Request() req) {
    const { id: authenticatedUserId, institutionId } = req.user;

    const existingUser = await this.usersService.findOne(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Only archived users can be unArchived
    const isArchived =
      existingUser.isActive === false &&
      existingUser.supabaseUid &&
      existingUser.supabaseUid !== '';

    if (!isArchived) {
      throw new BadRequestException('User is not archived');
    }

    // ✅ Check quota before unArchiving
    const usage = await this.usersService.getUsersUsage(institutionId);

    const limit =
      (existingUser.role === Role.INSTRUCTOR
        ? usage.instructors.limit
        : usage.students.limit) || 0;

    const consumedCount =
      existingUser.role === Role.INSTRUCTOR
        ? usage.instructors.consumed
        : usage.students.consumed;

    if (consumedCount >= limit) {
      throw new BadRequestException('You have reached the limit of accounts');
    }

    // ✅ Unarchive user (reactivate)
    return this.usersService.update(
      {
        isActive: true,
        updatedBy: authenticatedUserId,
      },
      { institutionId, id },
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
