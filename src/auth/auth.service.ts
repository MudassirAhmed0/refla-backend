import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider } from '@prisma/client';
import { Profile as GoogleProfile } from 'passport-google-oauth20';
import { sanitizeUser } from '@/users/sanitize-user';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.createUser({
      email: dto.email,
      passwordHash,
    });

    const accessToken = await this.signToken(user.id);

    return { accessToken, user:  sanitizeUser(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
  
    // User signed up via Google → they can't use password login
    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'This account uses Google login. Please log in with Google.',
      );
    }
  
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
  
    const accessToken = await this.signToken(user.id);
    return { accessToken, user: sanitizeUser(user) };
  }

  async validateGoogleLogin(profile: GoogleProfile) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new UnauthorizedException('Google account has no email');
    }
  
    // Try by provider + providerId first
    let user = await this.usersService.findByProvider(AuthProvider.google, profile.id);
  
    // Fallback: if a user with this email already exists (local signup first, then Google)
    if (!user) {
      const existingByEmail = await this.usersService.findByEmail(email);
      if (existingByEmail) {
        // Attach provider info to existing user
        user = await this.usersService['prisma'].user.update({
          where: { id: existingByEmail.id },
          data: {
            provider: AuthProvider.google,
            providerId: profile.id,
            name: existingByEmail.name ?? profile.displayName,
            avatarUrl:
              existingByEmail.avatarUrl ??
              profile.photos?.[0]?.value ??
              null,
          },
          include: {
            onboarding: true,
          },
        });
      }
    }
  
    // If still no user -> create new
    if (!user) {
      user = await this.usersService.createOAuthUser({
        email,
        provider: AuthProvider.google,
        providerId: profile.id,
        name: profile.displayName,
        avatarUrl: profile.photos?.[0]?.value,
      });
    }
  
    const accessToken = await this.signToken(user.id);
    return { accessToken, user:sanitizeUser(user) };
  }

  async signToken(userId: string): Promise<string> {
    return this.jwt.signAsync({ userId });
  }



  
}
