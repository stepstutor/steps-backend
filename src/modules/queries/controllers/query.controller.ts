// **** Library Imports ****
import {
  Get,
  Put,
  Body,
  Post,
  Param,
  Request,
  Response,
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
import { v4 as uuid } from 'uuid';
import { FileInterceptor } from '@nestjs/platform-express';

// **** External Imports ****
import { EmailService } from '@common/services/email.service';
import { UploadService } from '@common/services/upload.service';
import { SupabaseAuthGuard } from '@common/guards/supabase-auth.guard';

// **** Internal Imports ****
import { QueriesService } from '../queries.service';
import { CreateQueryDto } from '../dtos/createQueryDro';
import { UpdateQueryStatusDto } from '../dtos/updateQueryStatusDto';

@ApiTags('Queries')
@Controller('queries')
export class QueriesController {
  constructor(
    private readonly queriesService: QueriesService,
    private readonly uploadService: UploadService,
    private readonly emailService: EmailService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Submit a query' })
  @ApiBearerAuth('access-token')
  @UseGuards(SupabaseAuthGuard)
  @UseInterceptors(FileInterceptor('picture'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'I have a bug to report.' },
        picture: { type: 'string', format: 'binary' },
      },
      required: ['message'],
    },
  })
  async createQuery(
    @Request() req,
    @Response() res,
    @UploadedFile() picture: Express.Multer.File,
    @Body() createQueryDto: CreateQueryDto,
  ) {
    const { id: userId, firstName, lastName } = req.user;

    if (picture) {
      const pictureUrl = await this.uploadService.uploadFileToS3(picture);
      createQueryDto.pictureUrl = pictureUrl;
    }

    const query = await this.queriesService.create(userId, createQueryDto);
    res.status(201).json(query);
    if (query.pictureUrl) {
      const ext = query.pictureUrl.split('.').pop();
      await this.emailService.sendQueryEmail(
        `${firstName} ${lastName}`,
        query.message,
        [{ path: query.pictureUrl, filename: `${uuid()}.${ext}` }],
      );
    } else {
      await this.emailService.sendQueryEmail(
        `${firstName} ${lastName}`,
        query.message,
      );
    }
  }

  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all queries' })
  async getAllQueries() {
    return this.queriesService.findAll();
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update the status of a query' })
  @ApiBearerAuth('access-token')
  @UseGuards(SupabaseAuthGuard)
  async updateQueryStatus(
    @Param('id') id: string,
    @Body() updateQueryStatusDto: UpdateQueryStatusDto,
  ) {
    return this.queriesService.updateStatus(id, updateQueryStatusDto);
  }
}
