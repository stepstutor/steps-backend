// **** Library Imports ****
import {
  Inject,
  Logger,
  forwardRef,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import {
  In,
  Brackets,
  DataSource,
  Repository,
  FindManyOptions,
  FindOptionsWhere,
  FindOptionsSelect,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SupabaseClient } from '@supabase/supabase-js';

// **** External Imports ****
import { Role } from '@common/enums/userRole';
import { PaginationDTO } from '@common/dto/pagination.dto';
import { EmailService } from '@common/services/email.service';
import { UploadService } from '@common/services/upload.service';
import { CoursesService } from '@modules/courses/services/courses.service';
import { Invitation } from '@modules/invitations/entities/invitation.entity';
import { InvitationsService } from '@modules/invitations/invitations.service';
import { CourseStudent } from '@modules/courses/entities/course-student.entity';
import { InstitutionsService } from '@modules/institutions/institutions.service';
import { CourseInstructor } from '@modules/courses/entities/course-instructor.entity';
import { UserNotification } from '@modules/notifications/entities/userNotification.entity';

// **** Internal Imports ****
import { User } from '../entities/user.entity';
import { QueryParamsUsersDto } from '../dtos/queryParamsUsersDto';
import { UserWithInvitationLink } from '../types/userWithInvitationLink';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private dataSource: DataSource,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    @Inject(forwardRef(() => InvitationsService))
    private readonly invitationService: InvitationsService,
    private readonly uploadService: UploadService,
    private readonly supabaseClient: SupabaseClient,
    @Inject(forwardRef(() => InstitutionsService))
    private readonly institutionService: InstitutionsService,
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => CoursesService))
    private readonly coursesService: CoursesService,
  ) {}

  findAll(
    where: FindManyOptions<User>['where'],
    select?: FindOptionsSelect<User>,
  ): Promise<User[]> {
    return this.usersRepository.find({
      where: where,
      order: { lastName: 'ASC' },
      ...(select ? select : {}),
    });
  }

  findAllCustom(
    params: Omit<QueryParamsUsersDto, keyof PaginationDTO> & { institutionId },
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
  ): Promise<[User[], number]> {
    const query = this.usersRepository.createQueryBuilder('user');
    if (params.search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('user.firstName ILIKE :search', {
            search: `%${params.search}%`,
          })
            .orWhere('user.lastName ILIKE :search', {
              search: `%${params.search}%`,
            })
            .orWhere('user.email ILIKE :search', {
              search: `%${params.search}%`,
            });
        }),
      );
    }
    if (params.role && params.role.length) {
      query.andWhere('user.role IN (:...roles)', { roles: params.role });
    }
    if (params.institutionId) {
      query.andWhere('user.institutionId = :institutionId', {
        institutionId: params.institutionId,
      });
    }
    if (params.isActive !== undefined) {
      query.andWhere('user.isActive = :isActive', {
        isActive: params.isActive,
      });
    }
    if (params.isMember !== undefined) {
      if (params.isMember) {
        query.andWhere(
          'user.supabaseUid IS NOT NULL AND user.supabaseUid != :empty',
          { empty: '' },
        );
      } else {
        query.andWhere(
          new Brackets((qb) => {
            qb.where('user.supabaseUid IS NULL').orWhere(
              'user.supabaseUid = :empty',
              { empty: '' },
            );
          }),
        );
      }
    }
    if (params.orIsMember !== undefined) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where(
            'NOT (user.isActive = :isFalse AND user.supabaseUid != :empty AND user.supabaseUid IS NOT NULL)',
            {
              isFalse: false,
              empty: '',
            },
          );
        }),
      );
    }
    if (sortBy) {
      query.orderBy(`user.${sortBy}`, sortOrder || 'ASC');
    }
    if (page && limit) {
      query.skip((page - 1) * limit).take(limit);
    }

    return query.getManyAndCount();
  }

  findOne(
    id: string,
    withDeleted = false,
    relations: string[] = [],
  ): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      withDeleted,
      relations,
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  findBySupabaseUid(supabaseUid: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ supabaseUid });
  }

  async update(
    user: Partial<User>,
    where: FindOptionsWhere<User>,
  ): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { ...where },
    });

    if (!existingUser) {
      throw new BadRequestException();
    }

    const entity = this.usersRepository.merge(existingUser, user);
    return await this.usersRepository.save(entity);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async addBulk(users: Partial<User>[]): Promise<UserWithInvitationLink[]> {
    return this.dataSource.transaction(async () => {
      const usersList: UserWithInvitationLink[] = [];
      const expireAt = new Date(
        new Date().getTime() + 1000 * 60 * 60 * 24 * 100,
      );

      for await (const user of users) {
        const existingUser = await this.findByEmail(user.email!);

        if (existingUser) {
          continue;
        }

        const userEntity = await this.add({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          institutionId: user.institutionId,
          createdBy: user.createdBy,
          updatedBy: user.updatedBy,
        });

        const invitation = await this.invitationService.add({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          institutionId: user.institutionId,
          role: user.role,
          expireAt: expireAt,
        });

        const invitationLink = `${process.env.SITE_URL}/invitation/${invitation.id}`;

        usersList.push({ ...userEntity, invitationLink: invitationLink });
      }

      return usersList;
    });
  }

  async add(user: Partial<User>): Promise<User> {
    const obj = this.usersRepository.create(user);
    return this.usersRepository.save(obj);
  }

  findAllSuperAdmins(): Promise<User[]> {
    return this.usersRepository.find({
      where: {
        role: Role.SUPER_ADMIN,
      },
    });
  }

  findAllInstructors(instituteId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: {
        role: Role.INSTRUCTOR,
        institutionId: instituteId,
      },
    });
  }

  findAllStudents(instituteId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: {
        role: Role.STUDENT,
        institutionId: instituteId,
      },
    });
  }

  async updateProfile(
    userId: string,
    updates: { firstName?: string; lastName?: string },
    file?: Express.Multer.File,
  ): Promise<User> {
    const allowedFields = ['firstName', 'lastName'];
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key]) => allowedFields.includes(key)),
    );

    // Ensure there's at least one valid field to update or a file
    if (Object.keys(filteredUpdates).length === 0 && !file) {
      throw new BadRequestException(
        'No valid fields or file provided for update.',
      );
    }

    const existingUser = await this.findOne(userId);

    if (!existingUser) {
      throw new BadRequestException('User not found.');
    }

    // If a file is uploaded, upload to S3 and update profilePic
    if (file) {
      const profilePicUrl = await this.uploadService.uploadFileToS3(file);
      filteredUpdates['profilePic'] = profilePicUrl;
    } else {
      // Keep the old profile picture if no new file is uploaded
      filteredUpdates['profilePic'] = existingUser.profilePic;
    }

    const updatedUser = this.usersRepository.merge(
      existingUser,
      filteredUpdates,
    );
    return await this.usersRepository.save(updatedUser);
  }

  async updatePassword(body: { password: string }): Promise<any> {
    await this.supabaseClient.auth.updateUser({
      password: body.password,
    });
    return 'Password updated successfully.';
  }

  async findUsersByInstituteAndCountry(
    userRoles: Role[],
    institutionIds?: string[] | null,
    countries?: string[] | null,
    returnEmails: boolean = false,
  ): Promise<string[]> {
    let query = this.usersRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.email']) // Select user id and email
      .leftJoin('user.institution', 'institution')
      .where('user.role IN (:...userRoles)', { userRoles })
      .andWhere('user.isActive = true');

    if (institutionIds && institutionIds.length > 0) {
      query = query.andWhere('user.institutionId IN (:...institutionIds)', {
        institutionIds,
      });
    }

    if (countries && countries.length > 0) {
      query = query.andWhere('institution.country IN (:...countries)', {
        countries,
      });
    }

    const result = await query.getRawMany();
    return result.map((row) => (returnEmails ? row.user_email : row.user_id)); // Extract only the ids or email from the result
  }

  async resendInvite(id: string): Promise<{ message: string }> {
    const user = await this.findOne(id);
    if (!user) {
      throw new BadRequestException('User not found.');
    }

    const existingInvitation = await this.invitationRepository.findOne({
      where: {
        email: user.email,
      },
    });

    if (!existingInvitation) {
      throw new BadRequestException('Invitation not found.');
    }

    const invitation = {
      ...existingInvitation,
      expireAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 100),
    };

    const entity = this.invitationRepository.merge(
      existingInvitation,
      invitation,
    );
    await this.invitationRepository.save(entity);

    const invitationLink = `${process.env.SITE_URL}/invitation/${invitation?.id}`;
    const institution = await this.institutionService.findOne({
      id: user.institutionId as string,
    });
    await this.emailService.sendInvitationEmail(
      `${user.firstName} ${user.lastName}`,
      user.email,
      invitationLink!,
      institution?.language,
    );

    return { message: `Invitation resent to ${user.email}.` };
  }

  async softDelete(id: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id } });
      if (!user) {
        throw new BadRequestException('User not found');
      }
      const removedUser = await manager.softRemove(user);
      await manager.delete(Invitation, {
        email: user.email,
      });

      if (user.supabaseUid) {
        await this.supabaseClient.auth.admin.deleteUser(user.supabaseUid!);
      }

      if (removedUser) {
        if (removedUser.role === Role.INSTRUCTOR) {
          await this.coursesService.archiveCourseOfDeletedUser(removedUser.id);
        }
        if (removedUser.role === Role.STUDENT) {
          await this.coursesService.removeStudentFromCourses(removedUser.id);
        }
      }
    });
  }

  async archiveUsers(ids: string[]) {
    return this.usersRepository.update({ id: In(ids) }, { isActive: false });
  }

  async countUsersOfInstitutions(institutionIds: string[] = []): Promise<
    {
      institutionId: string;
      studentCount: number;
      instructorCount: number;
      adminCount: number;
    }[]
  > {
    const query = await this.usersRepository
      .createQueryBuilder('user')
      .select('user.institutionId', 'institutionId')
      .addSelect(
        'COUNT(*) FILTER (WHERE user.role = :studentRole)',
        'studentCount',
      )
      .addSelect(
        'COUNT(*) FILTER (WHERE user.role = :instructorRole)',
        'instructorCount',
      )
      .addSelect('COUNT(*) FILTER (WHERE user.role = :adminRole)', 'adminCount')
      .setParameters({
        studentRole: Role.STUDENT,
        instructorRole: Role.INSTRUCTOR,
        adminRole: Role.INSTITUTE_ADMIN,
      })
      .groupBy('user.institutionId');
    if (institutionIds.length > 0) {
      query.andWhere('user.institutionId IN (:...institutionIds)', {
        institutionIds,
      });
    }
    const result = await query.getRawMany();
    return result;
  }

  async addDirectUser(
    firstname: string,
    lastname: string,
    username: string,
    password: string,
    institutionId: string,
    role: Role = Role.INSTRUCTOR,
  ): Promise<boolean> {
    const { data, error } = await this.supabaseClient.auth.admin.createUser({
      email: username,
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: firstname,
        last_name: lastname,
      },
    });

    if (data?.user?.id) {
      await this.add({
        firstName: firstname,
        lastName: lastname,
        email: username,
        role: role,
        supabaseUid: data.user.id,
        institutionId: institutionId,
      });
      return true;
    }
    if (error) {
      this.logger.error(`Error creating direct user: ${error.message}`);
    }
    return false;
  }

  async getUsersUsage(institutionId: string) {
    const institution = await this.institutionService.findOne({
      id: institutionId,
    });

    // Base query with archive exclusion
    const qb = this.usersRepository
      .createQueryBuilder('user')
      .where('user.institutionId = :institutionId', { institutionId })
      .andWhere(
        new Brackets((qb) => {
          qb.where(
            'NOT (user.isActive = :isFalse AND user.supabaseUid != :empty AND user.supabaseUid IS NOT NULL)',
            {
              isFalse: false,
              empty: '',
            },
          );
        }),
      );

    // Count instructors
    const instructorsCount = await qb
      .clone()
      .andWhere('user.role = :role', { role: Role.INSTRUCTOR })
      .getCount();

    // Count students
    const studentsCount = await qb
      .clone()
      .andWhere('user.role = :role', { role: Role.STUDENT })
      .getCount();

    return {
      instructors: {
        consumed: instructorsCount,
        limit: institution?.instructorAccountsLimit,
      },
      students: {
        consumed: studentsCount,
        limit: institution?.studentAccountsLimit,
      },
    };
  }

  async deleteInvitation(
    userId: string,
    institutionId: string,
  ): Promise<{ message: string }> {
    return this.dataSource.transaction(async (manager) => {
      // Find the user and verify they belong to the institution
      const user = await manager.findOne(User, {
        where: {
          id: userId,
          institutionId: institutionId,
        },
      });

      if (!user) {
        throw new BadRequestException(
          'User not found or does not belong to your institution',
        );
      }

      // Check if user has already accepted the invitation
      const hasAcceptedInvitation = user.supabaseUid && user.supabaseUid !== '';

      if (hasAcceptedInvitation) {
        throw new BadRequestException(
          'Cannot delete user who has already accepted their invitation',
        );
      }

      // Delete the invitation first
      await manager.delete(Invitation, {
        email: user.email,
      });

      if (user.role === Role.INSTRUCTOR) {
        await manager.delete(CourseInstructor, {
          instructorId: userId,
        });
      } else if (user.role === Role.STUDENT) {
        await manager.delete(CourseStudent, {
          studentId: userId,
        });
      }
      await manager.delete(UserNotification, {
        userId: userId,
      });

      // Delete the user
      await manager.delete(User, { id: userId });

      return {
        message: `User invitation for ${user.email} has been successfully deleted`,
      };
    });
  }

  async updateWalkthroughScreens(
    userId: string,
    walkthroughScreens: string,
  ): Promise<User> {
    const user = await this.findOne(userId, false, ['institution']);
    if (!user) {
      throw new BadRequestException('User not found.');
    }

    user.walkthroughScreens = [
      ...(user.walkthroughScreens || []),
      walkthroughScreens,
    ];
    return await this.usersRepository.save(user);
  }
}
