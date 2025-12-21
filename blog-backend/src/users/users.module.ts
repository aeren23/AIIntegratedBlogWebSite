import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRole } from '../roles/entities/user-role.entity';
import { Role } from '../roles/entities/role.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserProfile } from './entities/user-profile.entity';
import { UserProfileService } from './user-profile.service';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole, Role, UserProfile]), LogsModule],
  controllers: [UsersController],
  providers: [UsersService, UserProfileService],
  exports: [TypeOrmModule, UsersService, UserProfileService],
})
export class UsersModule {}
