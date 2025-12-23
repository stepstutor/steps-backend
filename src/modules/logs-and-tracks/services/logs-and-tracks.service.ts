// **** Library Imports ****
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

// **** External Imports ****
import { OpenAiCallsType } from '@common/enums/open-ai-calls-type';
import { Institution } from '@modules/institutions/entities/institutions.entity';

// **** Internal Imports ****
import { CreateOpenAICallsLog } from '../types/open-ai-calls.type';
import { OpenAICallLogs } from '../entities/open-ai-call-logs.entity';

@Injectable()
export class LogsAndTracksService {
  constructor(
    @InjectRepository(OpenAICallLogs)
    private readonly openAICallLogsRepository: Repository<OpenAICallLogs>,
    @InjectRepository(Institution)
    private readonly institutionRepository: Repository<Institution>,
  ) {}

  createOpenAICallLog(createLogsAndTrackDto: CreateOpenAICallsLog) {
    const newLog = this.openAICallLogsRepository.create(createLogsAndTrackDto);
    return this.openAICallLogsRepository.save(newLog);
  }

  async getOpenAICallStats(startDate?: string, endDate?: string) {
    const query = this.institutionRepository
      .createQueryBuilder('institution')
      // manual join to users table (no entity relation needed)
      .leftJoin(
        'user',
        'u',
        `u."institutionId" = institution.id AND u."deletedAt" IS NULL`,
      )
      // manual join to logs table with optional date filters INSIDE the join
      .leftJoin(
        'open_ai_call_logs',
        'log',
        `
          log."userId" = u.id
          ${startDate ? 'AND log."createdAt" >= :startDate' : ''}
          ${endDate ? 'AND log."createdAt" <= :endDate' : ''}
        `,
        {
          startDate: startDate + 'T00:00:00.000Z',
          endDate: endDate + 'T23:59:59.999Z',
        },
      )
      .select('institution.id', 'institutionId')
      .addSelect('institution.name', 'institutionName');

    // Dynamically add COUNT columns for each enum value
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(OpenAiCallsType).forEach(([key, value]) => {
      query.addSelect(
        `CAST(COUNT(CASE WHEN log.type = '${value}' THEN 1 END) AS INT)`,
        `${value}Count`,
      );
    });

    query.groupBy('institution.id').addGroupBy('institution.name');
    const result = await query.getRawMany();
    return result;
  }
}
