import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma, OnboardingStatus } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { AiService } from '@/ai/ai.service';
import { z } from 'zod';

// ---- Zod schema for planData ----

const TrainingDaySchema = z.object({
  day: z.string(),
  focus: z.string(),
  durationMinutes: z.number().int().min(0),
  exercises: z.array(z.string()),
  notes: z.string().optional(),
});

const NutritionGuidelinesSchema = z.object({
  targetCalories: z.number().int().min(0),
  proteinGrams: z.number().int().min(0),
  carbsGrams: z.number().int().min(0),
  fatsGrams: z.number().int().min(0),
  mealsPerDay: z.number().int().min(1),
  notes: z.string().optional(),
  sampleMeals: z.array(z.string()).optional(),
});

const SleepAndRecoverySchema = z.object({
  targetSleepHours: z.number().min(0).max(24),
  sleepWindow: z.string(),
  preSleepRoutine: z.array(z.string()),
  recoveryPractices: z.array(z.string()),
});

const HabitSchema = z.object({
  name: z.string(),
  description: z.string(),
  frequency: z.enum(['daily', 'weekly', 'on_demand']),
});

const PlanDataSchema = z.object({
  summary: z.string(),
  keyFocuses: z.array(z.string()),
  training: z.array(TrainingDaySchema),
  nutrition: NutritionGuidelinesSchema,
  sleepRecovery: SleepAndRecoverySchema,
  habits: z.array(HabitSchema),
});

export type PlanData = z.infer<typeof PlanDataSchema>;

@Injectable()
export class PlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async generatePlanForUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { onboarding: true },
    });

    if (!user) {
      throw new InternalServerErrorException('User not found when generating plan');
    }

    if (!user.onboarding) {
      throw new BadRequestException('Onboarding not found. Complete onboarding first.');
    }

    if (user.onboarding.status !== OnboardingStatus.completed) {
      throw new BadRequestException(
        `Onboarding not completed (status: ${user.onboarding.status}).`,
      );
    }

    // Archive any existing active plans
    await this.prisma.plan.updateMany({
      where: {
        userId,
        status: 'active',
      },
      data: {
        status: 'archived',
      },
    });

    // Call AI service to generate a raw plan
    const rawPlan = await this.aiService.generatePlan({ userId });

    // Validate plan structure
    let planData: PlanData;
    try {
      planData = PlanDataSchema.parse(rawPlan);
    } catch (err) {
      throw new InternalServerErrorException('AI returned an invalid plan structure');
    }

    const planDataJson: Prisma.JsonValue = planData;

    // Store in DB as active plan
    const plan = await this.prisma.plan.create({
      data: {
        userId,
        status: 'active',
        planData: planDataJson,
      },
    });

    return plan;
  }

  async getActivePlan(userId: string) {
    return this.prisma.plan.findFirst({
      where: {
        userId,
        status: 'active',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getPlans(userId: string) {
    return this.prisma.plan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
