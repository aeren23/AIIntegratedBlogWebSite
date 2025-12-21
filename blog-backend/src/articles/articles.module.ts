import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { ArticleTag } from './entities/article-tag.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { Image } from '../images/entities/image.entity';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, ArticleTag, Category, User, Image]),
    LogsModule,
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [TypeOrmModule, ArticlesService],
})
export class ArticlesModule {}
