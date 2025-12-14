import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { Category } from '../categories/entities/category.entity';
import { Tag } from '../tags/entities/tag.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    console.log('🌱 Starting database seed...');

    // Create test user with the mock-user-id
    await this.seedUsers();
    
    // Create categories
    await this.seedCategories();
    
    // Create tags
    await this.seedTags();

    console.log('✅ Database seed completed!');
  }

  private async seedUsers() {
    const existingUser = await this.userRepository.findOne({
      where: { id: 'mock-user-id' },
    });

    if (!existingUser) {
      console.log('Creating test user...');
      
      // Create user with specific ID to match mock JWT
      const user = this.userRepository.create({
        id: 'mock-user-id',
        username: 'testauthor',
        email: 'testauthor@example.com',
        passwordHash: '$2b$10$mockhashedpassword', // Not a real hash, just for testing
        isActive: true,
      });
      
      await this.userRepository.save(user);

      // Create profile for the user
      const profile = this.userProfileRepository.create({
        userId: user.id,
        displayName: 'Test Author',
        bio: 'This is a test author account for development.',
        profileImageUrl: null,
      });
      
      await this.userProfileRepository.save(profile);
      
      console.log('✅ Test user created: mock-user-id (testauthor)');
    } else {
      console.log('Test user already exists');
    }
  }

  private async seedCategories() {
    const categories = [
      { name: 'Technology', slug: 'technology' },
      { name: 'Programming', slug: 'programming' },
      { name: 'Web Development', slug: 'web-development' },
      { name: 'DevOps', slug: 'devops' },
      { name: 'Career', slug: 'career' },
    ];

    for (const cat of categories) {
      const existing = await this.categoryRepository.findOne({
        where: { slug: cat.slug },
      });

      if (!existing) {
        await this.categoryRepository.save(this.categoryRepository.create(cat));
        console.log(`✅ Category created: ${cat.name}`);
      }
    }
  }

  private async seedTags() {
    const tags = [
      { name: 'JavaScript', slug: 'javascript' },
      { name: 'TypeScript', slug: 'typescript' },
      { name: 'NestJS', slug: 'nestjs' },
      { name: 'React', slug: 'react' },
      { name: 'Node.js', slug: 'nodejs' },
      { name: 'Docker', slug: 'docker' },
      { name: 'PostgreSQL', slug: 'postgresql' },
      { name: 'Tutorial', slug: 'tutorial' },
    ];

    for (const tag of tags) {
      const existing = await this.tagRepository.findOne({
        where: { slug: tag.slug },
      });

      if (!existing) {
        await this.tagRepository.save(this.tagRepository.create(tag));
        console.log(`✅ Tag created: ${tag.name}`);
      }
    }
  }
}
