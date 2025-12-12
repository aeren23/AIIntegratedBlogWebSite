import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { Article } from '../../articles/entities/article.entity';

@Entity('images')
export class Image extends BaseEntity {
  @Column({ type: 'uuid' })
  articleId: string;

  @Column()
  url: string;

  @Index()
  @Column({ unique: true })
  filename: string;

  @ManyToOne(() => Article, (article) => article.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'articleId' })
  article: Article;
}
