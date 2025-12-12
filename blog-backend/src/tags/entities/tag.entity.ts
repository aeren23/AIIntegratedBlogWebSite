import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { ArticleTag } from '../../articles/entities/article-tag.entity';

@Entity('tags')
export class Tag extends BaseEntity {
  @Index()
  @Column({ unique: true })
  name: string;

  @Index()
  @Column({ unique: true })
  slug: string;

  @OneToMany(() => ArticleTag, (articleTag) => articleTag.tag)
  articleTags: ArticleTag[];
}
