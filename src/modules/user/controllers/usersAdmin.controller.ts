// **** Library Imports ****
import {
  Get,
  Put,
  Body,
  Post,
  Param,
  Query,
  Delete,
  Logger,
  Request,
  UseGuards,
  Controller,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

// **** External Imports ****
import { Role } from '@common/enums/userRole';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { EmailService } from '@common/services/email.service';
import { InActiveUserGuard } from '@common/guards/inActiveUser.guard';
import { SupabaseAuthGuard } from '@common/guards/supabase-auth.guard';

// **** Internal Imports ****
import { UsersService } from '../services/users.service';
import { UpdateAdminUserDto } from '../dtos/admin/updateAdminUserDto';
import { CreateAdminUserDto } from '../dtos/admin/createAdminUserDto';
import { QueryParamsAdminGetUsersDto } from '../dtos/admin/queryParamsAdminGetUsersDto';
import { UsersAdminManagerService } from '../services/users.adminManager.service';

@ApiTags('Super Admins')
@Controller('admin/users')
export class UsersAdminController {
  private readonly logger = new Logger(UsersAdminController.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly usersAdminManagerService: UsersAdminManagerService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get super admin users' })
  @Roles([Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  get(@Query() params: QueryParamsAdminGetUsersDto, @Request() req) {
    const { id } = req.user;
    return this.usersAdminManagerService.getListOfUsers(params, id);
  }

  @Get('institute_admin_users')
  @ApiOperation({ summary: 'Get institutional admin users' })
  @Roles([Role.INSTITUTE_ADMIN, Role.INSTRUCTOR, Role.STUDENT])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  getInstitutionalAdminUsers(
    @Query() params: QueryParamsAdminGetUsersDto,
    @Request() req,
  ) {
    const { institutionId: userInstitutionId } = req.user;

    if (!userInstitutionId) {
      throw new BadRequestException(
        'User must belong to an institution to access this endpoint',
      );
    }
    return this.usersAdminManagerService.getInstitutionalAdminUsers(
      params,
      userInstitutionId,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update super admin user' })
  @Roles([Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateAdminUserBody: UpdateAdminUserDto,
  ) {
    const { id: authenticatedUserId } = req.user;
    return this.usersAdminManagerService.updateUser(
      id,
      authenticatedUserId,
      updateAdminUserBody,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Add admin user' })
  @Roles([Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @ApiBody({ type: CreateAdminUserDto })
  async create(@Request() req, @Body() adminUserBody: CreateAdminUserDto) {
    const { id: authenticatedUserId } = req.user;
    return this.usersAdminManagerService.createAdminUser(
      authenticatedUserId,
      adminUserBody,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete admin user' })
  @Roles([Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async delete(@Param('id') id: string) {
    try {
      await this.usersService.softDelete(id);
      return { message: 'User deleted successfully' };
    } catch (error) {
      this.logger.error(
        `Failed to delete user with id ${id}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Unable to delete user. Please contact support.',
      );
    }
  }
}
