import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';
import { ServiceResponse } from '../common/service-response';
import { JwtPayload } from './strategies/jwt.strategy';
import { LogService } from '../logs/log.service';
import { LogAction } from '../common/enums/log-action.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    private readonly jwtService: JwtService,
    private readonly logService: LogService,
  ) {}

  /**
   * Register a new user
   */
  async register(dto: RegisterDto): Promise<ServiceResponse<AuthResponseDto>> {
    // Check if username already exists
    const existingUsername = await this.userRepository.findOne({
      where: { username: dto.username },
    });
    if (existingUsername) {
      return ServiceResponse.fail('Username already exists');
    }

    // Check if email already exists
    const existingEmail = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingEmail) {
      return ServiceResponse.fail('Email already exists');
    }

    try {
      // Hash the password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(dto.password, saltRounds);

      // Create user
      const user = this.userRepository.create({
        username: dto.username,
        email: dto.email,
        passwordHash,
        isActive: true,
      });
      await this.userRepository.save(user);

      // Create default profile
      const profile = this.userProfileRepository.create({
        userId: user.id,
        displayName: dto.username,
      });
      await this.userProfileRepository.save(profile);

      // Generate JWT token
      const token = this.generateToken(user);

      void this.logService.createLog({
        userId: user.id,
        action: LogAction.CREATE,
        entityType: 'User',
        entityId: user.id,
        description: 'User registered',
      });
      return ServiceResponse.ok({
        accessToken: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: ['USER'], // Default role for new users
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      return ServiceResponse.fail('Failed to register user');
    }
  }

  /**
   * Login with username/email and password
   */
  async login(dto: LoginDto): Promise<ServiceResponse<AuthResponseDto>> {
    // Find user by username or email
    const user = await this.userRepository.findOne({
      where: [
        { username: dto.username },
        { email: dto.username },
      ],
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      return ServiceResponse.fail('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      return ServiceResponse.fail('Account is deactivated');
    }

    // Check if user is deleted
    if (user.isDeleted) {
      return ServiceResponse.fail('Account not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      return ServiceResponse.fail('Invalid credentials');
    }

    // Get user roles
    const roles = user.userRoles?.map((ur) => ur.role?.name).filter(Boolean) || ['USER'];

    // Generate JWT token
    const token = this.generateToken(user, roles);

    void this.logService.createLog({
      userId: user.id,
      action: LogAction.LOGIN,
      entityType: 'User',
      entityId: user.id,
      description: 'User logged in',
    });
    return ServiceResponse.ok({
      accessToken: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles,
      },
    });
  }

  /**
   * Generate JWT token for a user
   */
  private generateToken(user: User, roles: string[] = ['USER']): string {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      roles,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Validate user by ID (used by JWT strategy for additional checks)
   */
  async validateUserById(userId: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true, isDeleted: false },
    });
    return user;
  }
}
