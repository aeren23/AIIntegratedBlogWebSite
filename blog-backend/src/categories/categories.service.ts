import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { ServiceResponse } from '../common/service-response';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * Get all non-deleted categories
   */
  async getAll(): Promise<ServiceResponse<CategoryResponseDto[]>> {
    try {
      const categories = await this.categoryRepository.find({
        where: { isDeleted: false },
        order: { name: 'ASC' },
      });

      const dtos = categories.map((category) => this.mapToResponseDto(category));
      return ServiceResponse.ok(dtos);
    } catch (error) {
      return ServiceResponse.fail('Failed to retrieve categories');
    }
  }

  /**
   * Get single category by slug
   */
  async getBySlug(slug: string): Promise<ServiceResponse<CategoryResponseDto>> {
    try {
      const category = await this.categoryRepository.findOne({
        where: { slug, isDeleted: false },
      });

      if (!category) {
        return ServiceResponse.fail('Category not found');
      }

      return ServiceResponse.ok(this.mapToResponseDto(category));
    } catch (error) {
      return ServiceResponse.fail('Failed to retrieve category');
    }
  }

  /**
   * Create new category
   */
  async create(dto: CreateCategoryDto): Promise<ServiceResponse<CategoryResponseDto>> {
    try {
      // Check for duplicate name or slug
      const existing = await this.categoryRepository.findOne({
        where: [{ name: dto.name }, { slug: dto.slug }],
      });

      if (existing) {
        if (existing.name === dto.name) {
          return ServiceResponse.fail('Category with this name already exists');
        }
        if (existing.slug === dto.slug) {
          return ServiceResponse.fail('Category with this slug already exists');
        }
      }

      const category = this.categoryRepository.create(dto);
      const saved = await this.categoryRepository.save(category);

      return ServiceResponse.ok(this.mapToResponseDto(saved));
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT' || error.code === '23505') {
        return ServiceResponse.fail('Category with this name or slug already exists');
      }
      return ServiceResponse.fail('Failed to create category');
    }
  }

  /**
   * Update existing category
   */
  async update(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<ServiceResponse<CategoryResponseDto>> {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id, isDeleted: false },
      });

      if (!category) {
        return ServiceResponse.fail('Category not found');
      }

      // Check for duplicate name or slug (excluding current category)
      if (dto.name || dto.slug) {
        const existing = await this.categoryRepository
          .createQueryBuilder('category')
          .where('category.id != :id', { id })
          .andWhere('category.isDeleted = :isDeleted', { isDeleted: false })
          .andWhere('(category.name = :name OR category.slug = :slug)', {
            name: dto.name || category.name,
            slug: dto.slug || category.slug,
          })
          .getOne();

        if (existing) {
          if (existing.name === dto.name) {
            return ServiceResponse.fail('Category with this name already exists');
          }
          if (existing.slug === dto.slug) {
            return ServiceResponse.fail('Category with this slug already exists');
          }
        }
      }

      Object.assign(category, dto);
      const updated = await this.categoryRepository.save(category);

      return ServiceResponse.ok(this.mapToResponseDto(updated));
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT' || error.code === '23505') {
        return ServiceResponse.fail('Category with this name or slug already exists');
      }
      return ServiceResponse.fail('Failed to update category');
    }
  }

  /**
   * Soft delete category
   */
  async delete(id: string): Promise<ServiceResponse<void>> {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id, isDeleted: false },
      });

      if (!category) {
        return ServiceResponse.fail('Category not found');
      }

      // TODO: Check if category is used by any articles before deleting
      // TODO: Decide strategy: prevent deletion or cascade update articles

      category.isDeleted = true;
      await this.categoryRepository.save(category);

      return ServiceResponse.ok(null);
    } catch (error) {
      return ServiceResponse.fail('Failed to delete category');
    }
  }

  /**
   * Map Category entity to CategoryResponseDto
   */
  private mapToResponseDto(category: Category): CategoryResponseDto {
    const dto = new CategoryResponseDto();
    dto.id = category.id;
    dto.name = category.name;
    dto.slug = category.slug;
    dto.createdAt = category.createdAt;
    return dto;
  }
}
