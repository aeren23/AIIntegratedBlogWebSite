import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Article } from '../articles/entities/article.entity';
import { User } from '../users/entities/user.entity';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Article, User]), LogsModule],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [TypeOrmModule, CommentService],
})
export class CommentsModule {}
