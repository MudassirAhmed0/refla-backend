import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { OnboardingStatus, Prisma } from '@prisma/client';
import { UpdateGoalDataDto } from './dto/update-goals.dto';
import { UpdateCurrentStateDto } from './dto/update-current-state.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureOnboarding(userId: string) {
    let onboarding = await this.prisma.onboarding.findUnique({
      where: { userId },
    });

    if (!onboarding) {
      onboarding = await this.prisma.onboarding.create({
        data: {
          userId,
          status: OnboardingStatus.not_started,
        },
      });
    }

    return onboarding;
  }

  async getOnboarding(userId: string) {
    return this.prisma.onboarding.findUnique({
      where: { userId },
    });
  }

  private computeNextStatus(
    currentStatus: OnboardingStatus,
    goalData: unknown | null,
    currentStateData: unknown | null,
    routineData: unknown | null,
  ): OnboardingStatus {
    const hasGoals = !!goalData;
    const hasCurrent = !!currentStateData;
    const hasRoutine = !!routineData;

    // If all three present → completed
    if (hasGoals && hasCurrent && hasRoutine) {
      return OnboardingStatus.completed;
    }

    // If anything filled → in_progress
    if (hasGoals || hasCurrent || hasRoutine) {
      return OnboardingStatus.in_progress;
    }

    // Default
    return OnboardingStatus.not_started;
  }

  async updateGoals(userId: string, dto: UpdateGoalDataDto) {
    const existing = await this.ensureOnboarding(userId);

    const nextStatus = this.computeNextStatus(
      existing.status,
      dto.goalData,
      existing.currentStateData,
      existing.routineData,
    );

    const goalData: Prisma.InputJsonValue = {
      ...dto.goalData,
    };

    return this.prisma.onboarding.update({
      where: { userId },
      data: {
        goalData: goalData,
        status: nextStatus,
      },
    });
  }

  async updateCurrentState(userId: string, dto: UpdateCurrentStateDto) {
    const existing = await this.ensureOnboarding(userId);

    const nextStatus = this.computeNextStatus(
      existing.status,
      existing.goalData,
      dto.currentStateData,
      existing.routineData,
    );

    const currentStateData: Prisma.InputJsonValue = {
      ...dto.currentStateData,
    };
    return this.prisma.onboarding.update({
      where: { userId },
      data: {
        currentStateData: currentStateData,
        status: nextStatus,
      },
    });
  }

  async updateRoutine(userId: string, dto: UpdateRoutineDto) {
    const existing = await this.ensureOnboarding(userId);

    const nextStatus = this.computeNextStatus(
      existing.status,
      existing.goalData,
      existing.currentStateData,
      dto.routineData,
    );

    const routineData: Prisma.InputJsonValue = {
      ...dto.routineData,
    };
    return this.prisma.onboarding.update({
      where: { userId },
      data: {
        routineData: routineData,
        status: nextStatus,
      },
    });
  }
}
