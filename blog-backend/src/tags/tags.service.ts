import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagResponseDto } from './dto/tag-response.dto';
import { ServiceResponse } from '../common/service-response';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  /**
   * Get all non-deleted tags
   */
  async getAll(): Promise<ServiceResponse<TagResponseDto[]>> {
    try {
      const tags = await this.tagRepository.find({
        where: { isDeleted: false },
        order: { name: 'ASC' },
      });

      const dtos = tags.map((tag) => this.mapToResponseDto(tag));
      return ServiceResponse.ok(dtos);
    } catch (error) {
      return ServiceResponse.fail('Failed to retrieve tags');
    }
  }

  /**
   * Get single tag by slug
   */
  async getBySlug(slug: string): Promise<ServiceResponse<TagResponseDto>> {
    try {
      const tag = await this.tagRepository.findOne({
        where: { slug, isDeleted: false },
      });

      if (!tag) {
        return ServiceResponse.fail('Tag not found');
      }

      return ServiceResponse.ok(this.mapToResponseDto(tag));
    } catch (error) {
      return ServiceResponse.fail('Failed to retrieve tag');
    }
  }

  /**
   * Create new tag
   */
  async create(dto: CreateTagDto): Promise<ServiceResponse<TagResponseDto>> {
    try {
      // Check for duplicate name or slug
      const existing = await this.tagRepository.findOne({
        where: [{ name: dto.name }, { slug: dto.slug }],
      });

      if (existing) {
        if (existing.name === dto.name) {
          return ServiceResponse.fail('Tag with this name already exists');
        }
        if (existing.slug === dto.slug) {
          return ServiceResponse.fail('Tag with this slug already exists');
        }
      }

      const tag = this.tagRepository.create(dto);
      const saved = await this.tagRepository.save(tag);

      return ServiceResponse.ok(this.mapToResponseDto(saved));
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT' || error.code === '23505') {
        return ServiceResponse.fail('Tag with this name or slug already exists');
      }
      return ServiceResponse.fail('Failed to create tag');
    }
  }

  /**
   * Update existing tag
   */
  async update(
    id: string,
    dto: UpdateTagDto,
  ): Promise<ServiceResponse<TagResponseDto>> {
    try {
      const tag = await this.tagRepository.findOne({
        where: { id, isDeleted: false },
      });

      if (!tag) {
        return ServiceResponse.fail('Tag not found');
      }

      // Check for duplicate name or slug (excluding current tag)
      if (dto.name || dto.slug) {
        const existing = await this.tagRepository
          .createQueryBuilder('tag')
          .where('tag.id != :id', { id })
          .andWhere('tag.isDeleted = :isDeleted', { isDeleted: false })
          .andWhere('(tag.name = :name OR tag.slug = :slug)', {
            name: dto.name || tag.name,
            slug: dto.slug || tag.slug,
          })
          .getOne();

        if (existing) {
          if (existing.name === dto.name) {
            return ServiceResponse.fail('Tag with this name already exists');
          }
          if (existing.slug === dto.slug) {
            return ServiceResponse.fail('Tag with this slug already exists');
          }
        }
      }

      Object.assign(tag, dto);
      const updated = await this.tagRepository.save(tag);

      return ServiceResponse.ok(this.mapToResponseDto(updated));
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT' || error.code === '23505') {
        return ServiceResponse.fail('Tag with this name or slug already exists');
      }
      return ServiceResponse.fail('Failed to update tag');
    }
  }

  /**
   * Soft delete tag
   */
  async delete(id: string): Promise<ServiceResponse<void>> {
    try {
      const tag = await this.tagRepository.findOne({
        where: { id, isDeleted: false },
      });

      if (!tag) {
        return ServiceResponse.fail('Tag not found');
      }

      // TODO: Check if tag is used by any articles before deleting
      // TODO: Decide strategy: prevent deletion or cascade update article tags

      tag.isDeleted = true;
      await this.tagRepository.save(tag);

      return ServiceResponse.ok(null);
    } catch (error) {
      return ServiceResponse.fail('Failed to delete tag');
    }
  }

  /**
   * Map Tag entity to TagResponseDto
   */
  private mapToResponseDto(tag: Tag): TagResponseDto {
    const dto = new TagResponseDto();
    dto.id = tag.id;
    dto.name = tag.name;
    dto.slug = tag.slug;
    dto.createdAt = tag.createdAt;
    return dto;
  }
}
