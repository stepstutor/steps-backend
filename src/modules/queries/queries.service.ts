import { Repository } from 'typeorm';
import { Query } from './entities/query.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateQueryDto } from './dtos/createQueryDro';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateQueryStatusDto } from './dtos/updateQueryStatusDto';

@Injectable()
export class QueriesService {
  constructor(
    @InjectRepository(Query)
    private readonly queryRepository: Repository<Query>,
  ) {}

  async create(userId: string, createQueryDto: CreateQueryDto): Promise<Query> {
    // Find the latest reference number
    const latestQuery = await this.queryRepository.findOne({
      where: {},
      order: { referenceNumber: 'DESC' }, // Get the highest reference number
    });

    // Determine the next reference number
    const nextReferenceNumber = latestQuery
      ? Number(latestQuery.referenceNumber) + 1
      : 1;

    // Create new query with the reference number
    const query = this.queryRepository.create({
      userId,
      referenceNumber: nextReferenceNumber, // Assign the generated reference number
      message: createQueryDto.message,
      pictureUrl: createQueryDto.pictureUrl,
      status: 'Open',
    });
    return this.queryRepository.save(query);
  }

  async findAll(): Promise<Query[]> {
    return this.queryRepository.find({
      relations: ['user'], // Include user details
      order: { status: 'DESC' }, // Sort by status in ascending order (so "Open" comes first)
    });
  }

  async findById(id: string): Promise<Query> {
    const query = await this.queryRepository.findOne({ where: { id } });
    if (!query) {
      throw new NotFoundException('Query not found');
    }
    return query;
  }

  async updateStatus(
    id: string,
    updateQueryStatusDto: UpdateQueryStatusDto,
  ): Promise<Query> {
    const query = await this.findById(id);
    query.status = updateQueryStatusDto.status;
    return this.queryRepository.save(query);
  }
}
