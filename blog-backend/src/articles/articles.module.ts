import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { ArticleTag } from './entities/article-tag.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Article, ArticleTag, Category, User])],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [TypeOrmModule, ArticlesService],
})
export class ArticlesModule {}
