// **** Library Imports ****
import { UUID } from 'crypto';

// **** External Imports ****
import { Role } from '@common/enums/userRole';
import { EmailService } from '@common/services/email.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InstitutionsService } from '@modules/institutions/institutions.service';

// **** Internal Imports ****
import { UsersService } from './users.service';
import { CreateUserDto } from '../dtos/createUserDto';
import { QueryParamsUsersDto } from '../dtos/queryParamsUsersDto';
import { UserWithInvitationLink } from '../types/userWithInvitationLink';
import { createPaginatedResponse } from '@common/utils/pagination.util';

export class UsersManagerService {
  constructor(
    private readonly usersService: UsersService,
    private readonly institutionService: InstitutionsService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Retrieves a list of users based on institution ID and query parameters.
   * @param institutionId ID of the institution
   * @param params Query parameters for filtering users
   * @returns A list of users matching the criteria
   */
  async getUsers(institutionId: string, params: QueryParamsUsersDto) {
    const { page, limit, sortBy, sortOrder, ...filters } = params;
    const [users, totalRows] = await this.usersService.findAllCustom(
      { ...filters, institutionId },
      page,
      limit,
      sortBy,
      sortOrder,
    );
    return createPaginatedResponse(users, page, totalRows, limit);
  }

  /**
   * Retrieves usage statistics for instructors and students within an institution to see if they have reached their account limits of the institution.
   * @param institutionId ID of the institution
   * @returns Usage statistics for users
   */
  async getUsersUsage(institutionId: string) {
    return this.usersService.getUsersUsage(institutionId);
  }

  async createUsers(
    authenticatedUserId: UUID,
    institutionId: string,
    usersBody: CreateUserDto[],
  ) {
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

    this.sendInvitationEmails(users, institution?.language);
    return users;
  }

  /**
   * Sends invitation emails to a list of users.
   * @param users List of users with invitation links
   * @param institutionLanguage Language preference of the institution
   */
  private async sendInvitationEmails(
    users: UserWithInvitationLink[],
    institutionLanguage: string | undefined,
  ) {
    for (const user of users) {
      await this.emailService.sendInvitationEmail(
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.invitationLink!,
        institutionLanguage,
      );
      await new Promise((resolve) => setTimeout(resolve, 1500)); // 2 second delay
    }
  }

  /**
   * Unarchive (reactivate) a user account if it is archived.
   * @param userId ID of the user to be unarchived
   * @param authenticatedUserId ID of the user performing the action
   * @param institutionId ID of the institution
   * @returns The unarchived user
   */
  async unarchiveUser(
    userId: string,
    authenticatedUserId: UUID,
    institutionId: string,
  ) {
    const existingUser = await this.usersService.findOne(userId);
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
      { institutionId, id: userId },
    );
  }
}
