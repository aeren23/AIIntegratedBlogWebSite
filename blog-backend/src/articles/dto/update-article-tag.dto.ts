import { PartialType } from '@nestjs/swagger';
import { CreateArticleTagDto } from './create-article-tag.dto';

export class UpdateArticleTagDto extends PartialType(CreateArticleTagDto) {}
