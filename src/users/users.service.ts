import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthProvider } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        provider: 'local',
        onboarding: {
          create: {},
        },
      },
      include: {
        onboarding: true,
      },
    });
  }

  async createOAuthUser(params: {
    email: string;
    provider: AuthProvider;
    providerId: string;
    name?: string | null;
    avatarUrl?: string | null;
  }) {
    return this.prisma.user.create({
      data: {
        email: params.email,
        provider: params.provider,
        providerId: params.providerId,
        name: params.name ?? null,
        avatarUrl: params.avatarUrl ?? null,
        onboarding: {
          create: {},
        },
      },
      include: {
        onboarding: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { onboarding: true },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { onboarding: true },
    });
  }
  async findByProvider(provider: AuthProvider, providerId: string) {
    return this.prisma.user.findFirst({
      where: { provider, providerId },
      include: { onboarding: true },
    });
  }
}
