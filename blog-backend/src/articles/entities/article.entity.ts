import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { ArticleTag } from './article-tag.entity';
import { Image } from '../../images/entities/image.entity';
import { Comment } from '../../comments/entities/comment.entity';

@Entity('articles')
export class Article extends BaseEntity {
  @Index()
  @Column()
  title: string;

  @Index()
  @Column({ unique: true })
  slug: string;

  //html content
  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'uuid' })
  authorId: string;

  @Column({ type: 'uuid' })
  categoryId: string;

  @Index()
  @Column({ default: false })
  isPublished: boolean;

  @ManyToOne(() => User, (user) => user.articles, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @ManyToOne(() => Category, (category) => category.articles, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => ArticleTag, (articleTag) => articleTag.article)
  articleTags: ArticleTag[];

  @OneToMany(() => Image, (image) => image.article)
  images: Image[];

  @OneToMany(() => Comment, (comment) => comment.article)
  comments: Comment[];
}
