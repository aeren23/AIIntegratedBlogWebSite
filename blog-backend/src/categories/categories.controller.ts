import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Retrieve all non-deleted categories. Used for article creation dropdowns and filtering.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved categories',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 'c1-uuid',
            name: 'Backend Development',
            slug: 'backend',
            createdAt: '2024-01-01T10:00:00.000Z',
          },
          {
            id: 'c2-uuid',
            name: 'Frontend Development',
            slug: 'frontend',
            createdAt: '2024-01-02T10:00:00.000Z',
          },
          {
            id: 'c3-uuid',
            name: 'DevOps',
            slug: 'devops',
            createdAt: '2024-01-03T10:00:00.000Z',
          },
        ],
        errorMessage: null,
      },
    },
  })
  async getAll() {
    const result = await this.categoriesService.getAll();
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Get category by slug',
    description: 'Retrieve a single category by its slug.',
  })
  @ApiParam({
    name: 'slug',
    type: String,
    description: 'Category slug',
    example: 'backend',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved category',
    schema: {
      example: {
        success: true,
        data: {
          id: 'c1-uuid',
          name: 'Backend Development',
          slug: 'backend',
          createdAt: '2024-01-01T10:00:00.000Z',
        },
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'Category not found',
      },
    },
  })
  async getBySlug(@Param('slug') slug: string) {
    const result = await this.categoriesService.getBySlug(slug);
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create new category',
    description: 'Create a new category. Requires ADMIN or SUPERADMIN role.',
  })
  @ApiResponse({
    status: 201,
    description: 'Category successfully created',
    schema: {
      example: {
        success: true,
        data: {
          id: 'new-category-uuid',
          name: 'Machine Learning',
          slug: 'machine-learning',
          createdAt: '2024-01-15T14:30:00.000Z',
        },
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or duplicate category',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'Category with this name already exists',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const result = await this.categoriesService.create(createCategoryDto);
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update category',
    description: 'Update an existing category. Requires ADMIN or SUPERADMIN role.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Category UUID',
    example: 'c1-uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Category successfully updated',
    schema: {
      example: {
        success: true,
        data: {
          id: 'c1-uuid',
          name: 'Backend Development (Updated)',
          slug: 'backend',
          createdAt: '2024-01-01T10:00:00.000Z',
        },
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'Category not found',
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const result = await this.categoriesService.update(id, updateCategoryDto);
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete category',
    description: 'Soft delete a category. Requires ADMIN or SUPERADMIN role.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Category UUID',
    example: 'c1-uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Category successfully deleted',
    schema: {
      example: {
        success: true,
        data: null,
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'Category not found',
      },
    },
  })
  async delete(@Param('id') id: string) {
    const result = await this.categoriesService.delete(id);
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }
}
