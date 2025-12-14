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
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all tags',
    description: 'Retrieve all non-deleted tags. Used for article creation and filtering.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved tags',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 't1-uuid',
            name: 'NestJS',
            slug: 'nestjs',
            createdAt: '2024-01-01T10:00:00.000Z',
          },
          {
            id: 't2-uuid',
            name: 'TypeScript',
            slug: 'typescript',
            createdAt: '2024-01-02T10:00:00.000Z',
          },
          {
            id: 't3-uuid',
            name: 'TypeORM',
            slug: 'typeorm',
            createdAt: '2024-01-03T10:00:00.000Z',
          },
        ],
        errorMessage: null,
      },
    },
  })
  async getAll() {
    const result = await this.tagsService.getAll();
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Get tag by slug',
    description: 'Retrieve a single tag by its slug.',
  })
  @ApiParam({
    name: 'slug',
    type: String,
    description: 'Tag slug',
    example: 'nestjs',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved tag',
    schema: {
      example: {
        success: true,
        data: {
          id: 't1-uuid',
          name: 'NestJS',
          slug: 'nestjs',
          createdAt: '2024-01-01T10:00:00.000Z',
        },
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Tag not found',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'Tag not found',
      },
    },
  })
  async getBySlug(@Param('slug') slug: string) {
    const result = await this.tagsService.getBySlug(slug);
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create new tag',
    description: 'Create a new tag. Requires ADMIN or SUPERADMIN role.',
  })
  @ApiResponse({
    status: 201,
    description: 'Tag successfully created',
    schema: {
      example: {
        success: true,
        data: {
          id: 'new-tag-uuid',
          name: 'React',
          slug: 'react',
          createdAt: '2024-01-15T14:30:00.000Z',
        },
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or duplicate tag',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'Tag with this name already exists',
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
  async create(@Body() createTagDto: CreateTagDto) {
    const result = await this.tagsService.create(createTagDto);
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update tag',
    description: 'Update an existing tag. Requires ADMIN or SUPERADMIN role.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Tag UUID',
    example: 't1-uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tag successfully updated',
    schema: {
      example: {
        success: true,
        data: {
          id: 't1-uuid',
          name: 'NestJS Framework',
          slug: 'nestjs',
          createdAt: '2024-01-01T10:00:00.000Z',
        },
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Tag not found',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'Tag not found',
      },
    },
  })
  async update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    const result = await this.tagsService.update(id, updateTagDto);
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete tag',
    description: 'Soft delete a tag. Requires ADMIN or SUPERADMIN role.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Tag UUID',
    example: 't1-uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tag successfully deleted',
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
    description: 'Tag not found',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'Tag not found',
      },
    },
  })
  async delete(@Param('id') id: string) {
    const result = await this.tagsService.delete(id);
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }
}
