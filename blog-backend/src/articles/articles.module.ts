import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { ArticleTag } from './entities/article-tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Article, ArticleTag])],
  exports: [TypeOrmModule],
})
export class ArticlesModule {}
