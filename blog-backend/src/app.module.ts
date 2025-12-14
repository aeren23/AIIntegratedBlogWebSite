import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { ArticlesModule } from './articles/articles.module';
import { ImagesModule } from './images/images.module';
import { CommentsModule } from './comments/comments.module';
import { LogsModule } from './logs/logs.module';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './aiModule/ai.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'blog.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    CommonModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true, // Uygulamanın her yerinden erişilebilir olması için
      envFilePath: '../.env', // Üst dizindeki .env dosyasını kullan
    }),
    UsersModule,
    RolesModule,
    CategoriesModule,
    TagsModule,
    ArticlesModule,
    ImagesModule,
    CommentsModule,
    LogsModule,
    AiModule,
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
