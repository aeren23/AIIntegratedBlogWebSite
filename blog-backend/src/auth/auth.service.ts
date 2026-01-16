import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRole as UserRoleEntity } from '../roles/entities/user-role.entity';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';
import { ServiceResponse } from '../common/service-response';
import { JwtPayload } from './strategies/jwt.strategy';
import { LogService } from '../logs/log.service';
import { LogAction } from '../common/enums/log-action.enum';
import { UserRole } from './enums/user-role.enum';
import { EmailService } from '../email/email.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly logService: LogService,
    private readonly emailService: EmailService,
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

      // Generate email verification token
      const { token: verificationToken, expiry: verificationExpiry } = this.generateVerificationToken();

      const user = await this.userRepository.manager.transaction(
        async (manager) => {
          const userRepo = manager.getRepository(User);
          const roleRepo = manager.getRepository(Role);
          const userRoleRepo = manager.getRepository(UserRoleEntity);

          const createdUser = userRepo.create({
            username: dto.username,
            email: dto.email,
            passwordHash,
            isActive: true,
            emailVerified: false,
            emailVerificationToken: verificationToken,
            emailVerificationExpiry: verificationExpiry,
          });
          await userRepo.save(createdUser);

          const defaultRole = await roleRepo.findOne({
            where: { name: UserRole.USER },
          });

          if (!defaultRole) {
            throw new Error('Default role USER not found');
          }

          const userRole = userRoleRepo.create({
            userId: createdUser.id,
            roleId: defaultRole.id,
          });
          await userRoleRepo.save(userRole);

          return createdUser;
        },
      );

      // Send verification email
      try {
        await this.emailService.sendVerificationEmail(
          user.email,
          verificationToken,
          user.username,
        );
      } catch (emailError) {
        void this.logService.createLog({
          userId: user.id,
          action: LogAction.CREATE,
          entityType: 'User',
          entityId: user.id,
          description: 'Failed to send verification email',
        });
        // Continue with registration even if email fails
      }

      // Generate JWT token
      const token = this.generateToken(user, [UserRole.USER]);

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
          roles: [UserRole.USER],
          emailVerified: false,
        },
      });
    } catch (error) {
      void this.logService.createLog({
        action: LogAction.CREATE,
        entityType: 'User',
        entityId: 'unknown',
        description: `Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      const errorMessage =
        error instanceof Error && error.message === 'Default role USER not found'
          ? error.message
          : 'Failed to register user';
      return ServiceResponse.fail(errorMessage);
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
        emailVerified: user.emailVerified,
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

  /**
   * Verify user email with token
   */
  async verifyEmail(token: string): Promise<ServiceResponse<{ message: string }>> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return ServiceResponse.fail('Invalid verification token');
    }

    if (user.emailVerified) {
      return ServiceResponse.fail('Email already verified');
    }

    if (!user.emailVerificationExpiry || new Date() > user.emailVerificationExpiry) {
      return ServiceResponse.fail('Verification token has expired');
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpiry = null;
    await this.userRepository.save(user);

    void this.logService.createLog({
      userId: user.id,
      action: LogAction.UPDATE,
      entityType: 'User',
      entityId: user.id,
      description: 'Email verified',
    });

    return ServiceResponse.ok({ message: 'Email verified successfully' });
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<ServiceResponse<{ message: string }>> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      return ServiceResponse.fail('User not found');
    }

    if (user.emailVerified) {
      return ServiceResponse.fail('Email already verified');
    }

    // Generate new verification token
    const { token: verificationToken, expiry: verificationExpiry } = this.generateVerificationToken();

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpiry = verificationExpiry;
    await this.userRepository.save(user);

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationToken,
        user.username,
      );
    } catch (emailError) {
      void this.logService.createLog({
        userId: user.id,
        action: LogAction.UPDATE,
        entityType: 'User',
        entityId: user.id,
        description: 'Failed to send verification email',
      });
      return ServiceResponse.fail('Failed to send verification email');
    }

    return ServiceResponse.ok({ message: 'Verification email sent successfully' });
  }

  /**
   * Generate email verification token and expiry
   */
  private generateVerificationToken(): { token: string; expiry: Date } {
    const token = randomBytes(32).toString('hex');
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24); // Token expires in 24 hours
    return { token, expiry };
  }
}
