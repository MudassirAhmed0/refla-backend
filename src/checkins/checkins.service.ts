import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { GetCheckinsQueryDto } from './dto/get-checkins-query.dto';

@Injectable()
export class CheckinsService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeDate(date?: string): Date {
    if (!date) {
      return new Date();
    }
    return new Date(date);
  }

  async createCheckin(userId: string, dto: CreateCheckinDto) {
    const date = this.normalizeDate(dto.date);

    // Find active plan if any
    const activePlan = await this.prisma.plan.findFirst({
      where: {
        userId,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    });

    return this.prisma.checkin.create({
      data: {
        userId,
        planId: activePlan?.id ?? null,
        date,
        energy: dto.energy,
        mood: dto.mood,
        sleepQuality: dto.sleepQuality,
        adherence: dto.adherence,
        note: dto.note,
      },
    });
  }

  async getCheckins(userId: string, query: GetCheckinsQueryDto) {
    const where: any = { userId };

    if (query.from || query.to) {
      where.date = {};
      if (query.from) {
        where.date.gte = new Date(query.from);
      }
      if (query.to) {
        where.date.lte = new Date(query.to);
      }
    }

    return this.prisma.checkin.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }
}
