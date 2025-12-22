import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { Article } from '../../articles/entities/article.entity';

@Entity('images')
export class Image extends BaseEntity {
  @Column({ type: 'uuid' })
  articleId: string;

  @Column({ name: 'url' })
  publicUrl: string;

  @Index()
  @Column({ name: 'filename', unique: true })
  fileName: string;

  @Column({ type: 'text', nullable: true })
  filePath: string | null;

  @Column({ type: 'varchar', nullable: true })
  mimeType: string | null;

  @Column({ type: 'int', nullable: true })
  size: number | null;

  @ManyToOne(() => Article, (article) => article.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'articleId' })
  article: Article;
}
