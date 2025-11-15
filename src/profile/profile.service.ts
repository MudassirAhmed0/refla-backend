import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        onboarding: true,
      },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // Ensure profile exists
    let profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await this.prisma.userProfile.create({
        data: { userId },
      });
    }

    return this.prisma.userProfile.update({
      where: { userId },
      data: dto,
    });
  }
}
