// **** Library Imports ****
import {
  Get,
  Put,
  Body,
  Post,
  Param,
  Query,
  Request,
  UseGuards,
  Controller,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiQuery,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';

// **** External Imports ****
import { Role } from '@common/enums/userRole';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { InActiveUserGuard } from '@common/guards/inActiveUser.guard';
import { SupabaseAuthGuard } from '@common/guards/supabase-auth.guard';

// **** Internal Imports ****
import { InstitutionsService } from '../institutions.service';
import { CreateInstitutionDto } from '../dtos/createInstitutionDto';
import { UpdateInstitutionDto } from '../dtos/updateInstitutionDto';
import { InstitutionPaginationDto } from '../dtos/institutionPagination.dto';
import { GetInstitutesByCountriesDto } from '../dtos/getInstitutesByCountry.dto';

@ApiTags('Institutions')
@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get institutions' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['name', 'country', 'isActive'],
    description: 'Field to sort by',
    example: 'name',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order (ASC or DESC)',
    example: 'ASC',
  })
  @Roles([Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  getAll(@Query() query: InstitutionPaginationDto) {
    return this.institutionsService.findAll(undefined, query);
  }

  @Get('/by-country/:country')
  @ApiOperation({ summary: 'Get institution By Country' })
  @Roles([Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async getByCountry(@Param('country') country: string) {
    const institution = await this.institutionsService.findAllByParams({
      country,
    });
    if (!institution) {
      throw new NotFoundException();
    }
    return institution;
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get institution' })
  @Roles([Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async get(@Param('id') id: string) {
    const institution = await this.institutionsService.findOne({ id: id });
    if (!institution) {
      throw new NotFoundException();
    }
    return institution;
  }

  @Post()
  @ApiOperation({ summary: 'Add an institution' })
  @Roles([Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  create(@Request() req, @Body() createInstitutionBody: CreateInstitutionDto) {
    const { id: authenticatedUserId } = req.user;
    const { adminEmail, adminFirstName, adminLastName, ...rest } =
      createInstitutionBody;
    return this.institutionsService.add(
      {
        ...rest,
        createdBy: authenticatedUserId,
        updatedBy: authenticatedUserId,
      },
      adminEmail,
      adminFirstName,
      adminLastName,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an institution' })
  @Roles([Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateInstitutionBody: UpdateInstitutionDto,
  ) {
    const { id: authenticatedUserId } = req.user;
    return this.institutionsService.update(
      {
        ...updateInstitutionBody,
        updatedBy: authenticatedUserId,
      },
      { id },
    );
  }

  @Post('by-counrty')
  @ApiOperation({ summary: 'Get institutions by country' })
  @Roles([Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, InActiveUserGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  getInstituesByCountry(@Body() body: GetInstitutesByCountriesDto) {
    if (body.countries.length === 1 && body.countries[0] === 'All') {
      return this.institutionsService.findByCountries(undefined);
    }
    return this.institutionsService.findByCountries(body.countries);
  }
}
