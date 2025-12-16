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
  DataSource,
  Repository,
  FindManyOptions,
  FindOptionsWhere,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

// **** External Imports ****
import {
  PaginatedResponse,
  createPaginatedResponse,
} from '@common/utils/pagination.util';
import { Role } from '@common/enums/userRole';
import { UsersService } from '@modules/user/services/users.service';
import { EmailService } from '@common/services/email.service';
import { Course } from '@modules/courses/entities/course.entity';

// **** Internal Imports ****
import {
  InstitutionWithCounts,
  InstitutionWithCourses,
} from './dtos/institutionsListWithCountsResp';
import { Institution } from './entities/institutions.entity';
import { InstitutionPaginationDto } from './dtos/institutionPagination.dto';

@Injectable()
export class InstitutionsService {
  private readonly logger = new Logger(InstitutionsService.name);
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly dataSource: DataSource,
    @InjectRepository(Institution)
    private institutionsRepository: Repository<Institution>,
  ) {}

  async findAll(
    where?: FindOptionsWhere<Institution>,
    paginationDto?: InstitutionPaginationDto,
  ): Promise<PaginatedResponse<InstitutionWithCounts>> {
    const options: FindManyOptions<Institution> = {};
    if (where) {
      options.where = where;
    }
    if (paginationDto && Object.keys(paginationDto).length > 0) {
      options.skip = (paginationDto.page - 1) * paginationDto.limit;
      options.take = paginationDto.limit;
    }
    if (paginationDto?.sortBy) {
      options.order = {
        [paginationDto.sortBy]: paginationDto.sortOrder || 'ASC',
      };
    }
    const [institutions, count] =
      await this.institutionsRepository.findAndCount(options);
    if (count === 0) {
      return createPaginatedResponse<InstitutionWithCounts>(
        [],
        paginationDto?.page || 1,
        count,
        paginationDto?.limit,
      );
    }
    const [institutionUsersCounts, institutionCoursesCounts] =
      await Promise.all([
        this.usersService.countUsersOfInstitutions(
          institutions.map((inst) => inst.id),
        ),
        this.dataSource
          .getRepository(Course)
          .createQueryBuilder('course')
          .select('course.institutionId')
          .addSelect('COUNT(course.id)', 'coursesCount')
          .groupBy('course.institutionId')
          .where('course.institutionId IN (:...institutionIds)', {
            institutionIds: institutions.map((inst) => inst.id),
          })
          .getRawMany(),
      ]);
    const coursesCount = institutionCoursesCounts.reduce(
      (acc, curr) => {
        acc[curr.course_institutionId] = curr.coursesCount;
        return acc;
      },
      {} as Record<string, number>,
    );
    const usersCount = institutionUsersCounts.reduce(
      (acc, curr) => {
        const { institutionId, ...rest } = curr;
        acc[institutionId] = rest;
        return acc;
      },
      {} as Record<
        string,
        {
          studentCount: number;
          instructorCount: number;
          adminCount: number;
        }
      >,
    );

    const institutionsWithCounts: InstitutionWithCounts[] = institutions.map(
      (inst) => {
        return {
          ...inst,
          coursesCount: coursesCount[inst.id] || 0,
          studentsCount: usersCount[inst.id]?.studentCount || 0,
          instructorsCount: usersCount[inst.id]?.instructorCount || 0,
        };
      },
    );
    return createPaginatedResponse<InstitutionWithCounts>(
      institutionsWithCounts,
      paginationDto?.page || 1,
      count,
      paginationDto?.limit,
    );
  }

  async findAllByParams(
    where: FindOptionsWhere<Institution>,
  ): Promise<Institution[]> {
    return this.institutionsRepository.find({ where: where });
  }

  async findOne(
    where: FindOptionsWhere<Institution>,
  ): Promise<Institution | null> {
    return this.institutionsRepository.findOneBy(where);
  }

  async add(
    institution: Partial<Institution>,
    adminEmail: string,
    adminFirstName: string,
    adminLastName: string,
  ): Promise<Institution> {
    const obj = this.institutionsRepository.create(institution);
    const newInstitution = await this.institutionsRepository.save(obj);
    const users = await this.usersService.addBulk([
      {
        firstName: adminFirstName,
        lastName: adminLastName,
        email: adminEmail,
        role: Role.INSTITUTE_ADMIN,
        isActive: false,
        createdBy: institution.createdBy,
        updatedBy: institution.updatedBy,
        institutionId: newInstitution.id,
      },
    ]);
    await Promise.all(
      users.map((user) =>
        this.emailService.sendInvitationEmail(
          `${user.firstName} ${user.lastName}`,
          user.email,
          user.invitationLink!,
          newInstitution.language,
        ),
      ),
    );
    return newInstitution;
  }

  async update(
    institution: Partial<Institution>,
    where: FindOptionsWhere<Institution>,
  ): Promise<Institution> {
    const existingInstitution = await this.institutionsRepository.findOne({
      where: { ...where },
    });

    if (!existingInstitution) {
      throw new BadRequestException();
    }

    const entity = this.institutionsRepository.merge(
      existingInstitution,
      institution,
    );
    return await this.institutionsRepository.save(entity);
  }

  async findByCountries(
    countries: string[] | undefined,
  ): Promise<InstitutionWithCourses[]> {
    const institutions = await this.institutionsRepository.find({
      where: countries
        ? {
            country: In(countries),
          }
        : countries,
      relations: ['courses'],
    });

    return await Promise.all(
      institutions.map(async (inst) => {
        const courses = await inst.courses;
        return {
          id: inst.id,
          name: inst.name,
          courses: courses.map((c) => ({ courseId: c.id, name: c.name })),
          country: inst.country,
          coursesCount: courses.length,
        };
      }),
    );
  }

  async addInstructorsWithoutVerification(
    institutionId: string,
    file: Express.Multer.File,
  ): Promise<{ message: string; processedRows: number }> {
    const rows = await this.parseCsv(file);
    let processedRows = 1;
    let successCount = 0;
    const totalRows = rows.length;

    for await (const row of rows) {
      try {
        const added = await this.usersService.addDirectUser(
          row.firstname,
          row.lastname,
          row.username,
          row.password,
          institutionId,
        );
        if (added) successCount++;
      } catch (error) {
        this.logger.error(
          `Error processing row ${processedRows}/${totalRows}: ${error}`,
        );
      }
      processedRows++;
    }

    return {
      message: `${successCount} Instructors added successfully`,
      processedRows,
    };
  }

  async addStudentsWithoutVerification(
    institutionId: string,
    file: Express.Multer.File,
  ): Promise<{ message: string; processedRows: number }> {
    const rows = await this.parseCsv(file);
    let processedRows = 1;
    let successCount = 0;
    const totalRows = rows.length;

    for await (const row of rows) {
      try {
        const added = await this.usersService.addDirectUser(
          row.firstname,
          row.lastname,
          row.username,
          row.password,
          institutionId,
          Role.STUDENT,
        );
        if (added) successCount++;
      } catch (error) {
        this.logger.error(
          `Error processing row ${processedRows}/${totalRows}: ${error}`,
        );
      }
      processedRows++;
    }

    return {
      message: `${successCount} Students added successfully`,
      processedRows,
    };
  }

  private async parseCsv(file: Express.Multer.File): Promise<any[]> {
    this.logger.log('Parsing CSV file:', file.originalname);
    const rows: any[] = [];
    const csv = file.buffer.toString();
    const lines = csv.split('\n');
    this.logger.log('Total lines: ' + lines.length);
    for (const line of lines) {
      const [firstname, lastname, username, password] = line.split(',');
      if (username === 'username') {
        continue;
      }
      rows.push({
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        username: username.trim(),
        password: password.trim(), // password contains trailing /n so trimming is necessary
      });
    }
    return rows;
  }
}
