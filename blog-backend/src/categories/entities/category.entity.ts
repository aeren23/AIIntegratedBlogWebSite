import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { Article } from '../../articles/entities/article.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @Index()
  @Column({ unique: true })
  name: string;

  @Index()
  @Column({ unique: true })
  slug: string;

  @OneToMany(() => Article, (article) => article.category)
  articles: Article[];
}
