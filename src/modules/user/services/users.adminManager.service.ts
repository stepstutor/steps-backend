// **** Library Imports ****
import { UUID } from 'crypto';
import { Equal, IsNull, Not, Or } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';

// **** External Imports ****
import { Role } from '@common/enums/userRole';
import { EmailService } from '@common/services/email.service';

// **** Internal Imports ****
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';
import { UpdateAdminUserDto } from '../dtos/admin/updateAdminUserDto';
import { CreateAdminUserDto } from '../dtos/admin/createAdminUserDto';
import { UserWithInvitationLink } from '../types/userWithInvitationLink';
import { QueryParamsAdminGetUsersDto } from '../dtos/admin/queryParamsAdminGetUsersDto';

@Injectable()
export class UsersAdminManagerService {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  async getListOfUsers(
    params: QueryParamsAdminGetUsersDto,
    thisUserId: string,
  ): Promise<User[]> {
    const { isMember, ...rest } = params;
    return this.usersService.findAll({
      ...rest,
      id: Not(thisUserId),
      ...(isMember !== undefined
        ? {
            supabaseUid: isMember
              ? Or(Not(''), Not(null))
              : Or(IsNull(), Equal('')),
          }
        : {}),
    });
  }

  async getInstitutionalAdminUsers(
    params: QueryParamsAdminGetUsersDto,
    userInstitutionId: string,
  ): Promise<User[]> {
    const { isMember, ...rest } = params;

    return this.usersService.findAll({
      ...rest,
      institutionId: userInstitutionId,
      role: Role.INSTITUTE_ADMIN,
      ...(isMember !== undefined
        ? {
            supabaseUid: isMember
              ? Or(Not(''), Not(null))
              : Or(IsNull(), Equal('')),
          }
        : {}),
    });
  }

  async updateUser(
    updateUserId: string,
    authenticatedUserId: UUID,
    updateAdminUserBody: UpdateAdminUserDto,
  ): Promise<User> {
    const { institutionId } = updateAdminUserBody;
    if (institutionId) {
      return this.usersService.update(
        {
          ...updateAdminUserBody,
          updatedBy: authenticatedUserId,
        },
        {
          id: updateUserId,
          role: Role.INSTITUTE_ADMIN,
          institutionId: institutionId,
        },
      );
    }
    return this.usersService.update(
      {
        ...updateAdminUserBody,
        updatedBy: authenticatedUserId,
      },
      { id: updateUserId, role: Role.SUPER_ADMIN },
    );
  }

  async createAdminUser(
    authenticatedUserId: UUID,
    adminUserBody: CreateAdminUserDto,
  ): Promise<UserWithInvitationLink[]> {
    const { email, institutionId } = adminUserBody;
    const existingAdminUser = await this.usersService.findByEmail(email);
    if (existingAdminUser) {
      throw new BadRequestException('User already exists');
    }

    const users = await this.usersService.addBulk([
      {
        ...adminUserBody,
        isActive: false,
        createdBy: authenticatedUserId,
        updatedBy: authenticatedUserId,
        role: institutionId ? Role.INSTITUTE_ADMIN : Role.SUPER_ADMIN,
        institutionId: institutionId ?? null,
      },
    ]);

    await Promise.all(
      users.map(async (user) =>
        this.emailService.sendInvitationEmail(
          `${user.firstName} ${user.lastName}`,
          user.email,
          user.invitationLink!,
          (await user.institution)?.language,
        ),
      ),
    );
    return users;
  }
}
