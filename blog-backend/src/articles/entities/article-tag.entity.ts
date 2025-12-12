import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { Article } from './article.entity';
import { Tag } from '../../tags/entities/tag.entity';

@Entity('article_tags')
@Index(['articleId', 'tagId'], { unique: true })
export class ArticleTag extends BaseEntity {
  @Column({ type: 'uuid' })
  articleId: string;

  @Column({ type: 'uuid' })
  tagId: string;

  @ManyToOne(() => Article, (article) => article.articleTags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'articleId' })
  article: Article;

  @ManyToOne(() => Tag, (tag) => tag.articleTags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tagId' })
  tag: Tag;
}
