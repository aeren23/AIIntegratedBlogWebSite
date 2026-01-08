import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { Category } from '../categories/entities/category.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from '../roles/entities/user-role.entity';

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
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    console.log('🌱 Starting database seed...');

    // Create roles first
    await this.seedRoles();
    
    // Create test user and admin user
    await this.seedUsers();
    
    // Create categories
    await this.seedCategories();
    
    // Create tags
    await this.seedTags();

    console.log('✅ Database seed completed!');
  }

  private async seedRoles() {
    const roleNames = ['USER', 'AUTHOR', 'ADMIN', 'SUPERADMIN'];

    for (const roleName of roleNames) {
      const existing = await this.roleRepository.findOne({
        where: { name: roleName },
      });

      if (!existing) {
        await this.roleRepository.save(
          this.roleRepository.create({ name: roleName }),
        );
        console.log(`✅ Role created: ${roleName}`);
      }
    }
  }

  private async seedUsers() {
    // Get roles for assignment
    const userRole = await this.roleRepository.findOne({
      where: { name: 'USER' },
    });
    const authorRole = await this.roleRepository.findOne({
      where: { name: 'AUTHOR' },
    });
    const adminRole = await this.roleRepository.findOne({
      where: { name: 'ADMIN' },
    });
    const superAdminRole = await this.roleRepository.findOne({
      where: { name: 'SUPERADMIN' },
    });

    // Seed Admin User (with SUPERADMIN role)
    const existingAdmin = await this.userRepository.findOne({
      where: { username: 'admin' },
    });

    if (!existingAdmin) {
      console.log('Creating admin user...');

      // Hash password: "admin123"
      const passwordHash = await bcrypt.hash('Admin123!', 10);

      const admin = this.userRepository.create({
        username: 'admin',
        email: 'admin@example.com',
        passwordHash,
        isActive: true,
      });

      await this.userRepository.save(admin);

      // Create profile
      const adminProfile = this.userProfileRepository.create({
        userId: admin.id,
        displayName: 'System Administrator',
        bio: 'System administrator account for user management.',
        profileImageUrl: null,
      });

      await this.userProfileRepository.save(adminProfile);

      // Assign ADMIN and SUPERADMIN roles
      if (adminRole) {
        await this.userRoleRepository.save(
          this.userRoleRepository.create({
            userId: admin.id,
            roleId: adminRole.id,
          }),
        );
      }
      if (superAdminRole) {
        await this.userRoleRepository.save(
          this.userRoleRepository.create({
            userId: admin.id,
            roleId: superAdminRole.id,
          }),
        );
      }

      console.log(
        '✅ Admin user created: admin / Admin123! (ADMIN + SUPERADMIN roles assigned)',
      );
    } else {
      // Check if existing admin has SUPERADMIN role, if not add it
      const existingRoles = await this.userRoleRepository.find({
        where: { userId: existingAdmin.id },
        relations: ['role'],
      });
      
      const hasSuperAdmin = existingRoles.some(ur => ur.role?.name === 'SUPERADMIN');
      
      if (!hasSuperAdmin && superAdminRole) {
        await this.userRoleRepository.save(
          this.userRoleRepository.create({
            userId: existingAdmin.id,
            roleId: superAdminRole.id,
          }),
        );
        console.log('✅ SUPERADMIN role added to existing admin user');
      } else {
        console.log('Admin user already exists with SUPERADMIN role');
      }
    }

    // Seed Test Author User
    const existingAuthor = await this.userRepository.findOne({
      where: { username: 'testauthor' },
    });

    if (!existingAuthor) {
      console.log('Creating test author user...');

      // Hash password: "password123"
      const passwordHash = await bcrypt.hash('password123', 10);

      const author = this.userRepository.create({
        username: 'testauthor',
        email: 'testauthor@example.com',
        passwordHash,
        isActive: true,
      });

      await this.userRepository.save(author);

      // Create profile
      const authorProfile = this.userProfileRepository.create({
        userId: author.id,
        displayName: 'Test Author',
        bio: 'This is a test author account for development.',
        profileImageUrl: null,
      });

      await this.userProfileRepository.save(authorProfile);

      // Assign USER and AUTHOR roles
      if (userRole) {
        await this.userRoleRepository.save(
          this.userRoleRepository.create({
            userId: author.id,
            roleId: userRole.id,
          }),
        );
      }
      if (authorRole) {
        await this.userRoleRepository.save(
          this.userRoleRepository.create({
            userId: author.id,
            roleId: authorRole.id,
          }),
        );
      }

      console.log(
        '✅ Test author created: testauthor / password123 (USER, AUTHOR roles assigned)',
      );
    } else {
      console.log('Test author already exists');
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
