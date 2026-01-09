import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { Tag } from '../entities/tag.entity';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const tag = this.tagRepository.create(createTagDto);
    return await this.tagRepository.save(tag);
  }

  async findAll(
    where?: FindOptionsWhere<Tag>,
    page?: number,
    limit?: number,
    sortBy: keyof Tag = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{ data: Tag[]; total: number }> {
    const [data, total] = await this.tagRepository.findAndCount({
      where,
      order: { [sortBy]: sortOrder } as Record<string, 'ASC' | 'DESC'>,
      skip: page && limit ? (page - 1) * limit : undefined,
      take: limit,
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);
    Object.assign(tag, updateTagDto);
    return await this.tagRepository.save(tag);
  }

  async remove(id: string): Promise<{ message: string }> {
    const tag = await this.findOne(id);
    await this.tagRepository.remove(tag);
    return { message: 'Tag removed successfully' };
  }

  async search(
    term: string,
    limit: number = 10,
    threshold: number = 0.2,
  ): Promise<Tag[]> {
    const normalizedTerm = term?.trim();
    if (!normalizedTerm) {
      return [];
    }

    return await this.tagRepository
      .createQueryBuilder('tag')
      .where('similarity(tag.name, :term) >= :threshold', {
        term: normalizedTerm,
        threshold,
      })
      .orderBy('similarity(tag.name, :term)', 'DESC')
      .addOrderBy('tag.name', 'ASC')
      .limit(limit)
      .getMany();
  }

  async findOrCreateTagsByNames(tagNames: string[]): Promise<Tag[]> {
    const tags: Tag[] = [];
    for (const name of tagNames) {
      let tag = await this.tagRepository.findOne({ where: { name } });
      if (!tag) {
        tag = this.tagRepository.create({ name });
        await this.tagRepository.save(tag);
      }
      tags.push(tag);
    }
    return tags;
  }
}
