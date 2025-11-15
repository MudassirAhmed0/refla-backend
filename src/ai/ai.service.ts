import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { OnboardingStatus } from '@prisma/client';
import OpenAI from 'openai';

// ---- Plan types (shape of JSON we expect from the model) ----

export interface TrainingDay {
  day: string; // e.g. "Monday"
  focus: string; // e.g. "Upper body strength"
  durationMinutes: number;
  exercises: string[]; // high-level exercise list
  notes?: string;
}

export interface NutritionGuidelines {
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  mealsPerDay: number;
  notes?: string;
  sampleMeals?: string[];
}

export interface SleepAndRecovery {
  targetSleepHours: number;
  sleepWindow: string; // e.g. "22:30–06:30"
  preSleepRoutine: string[];
  recoveryPractices: string[]; // e.g. "10-minute walk", "stretching", etc.
}

export interface Habit {
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'on_demand';
}

export interface PlanData {
  summary: string;
  keyFocuses: string[]; // e.g. ["fix sleep", "increase protein", "3 consistent workouts/week"]
  training: TrainingDay[];
  nutrition: NutritionGuidelines;
  sleepRecovery: SleepAndRecovery;
  habits: Habit[];
}

// ---- Context type we pass into the model ----

export interface UserContext {
  user: {
    id: string;
    email: string;
    createdAt: string;
    provider: string;
  };
  profile: any | null; // whatever is in UserProfile JSON-wise
  onboarding: {
    status: OnboardingStatus;
    goalData: any | null;
    currentStateData: any | null;
    routineData: any | null;
  } | null;
  recentCheckins: Array<{
    date: string;
    energy: number;
    mood: number;
    sleepQuality: number;
    adherence: number;
    note?: string | null;
  }>;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('ai.openaiApiKey');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY (ai.openaiApiKey) is not configured');
    }

    this.client = new OpenAI({
      apiKey,
    });
  }

  // ------------- Context builder -------------

  async buildUserContext(userId: string): Promise<UserContext> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        onboarding: true,
        checkins: {
          orderBy: { date: 'desc' },
          take: 7,
        },
      },
    });

    if (!user) {
      throw new InternalServerErrorException('User not found when building context');
    }

    const context: UserContext = {
      user: {
        id: user.id,
        email: user.email,
        provider: user.provider,
        createdAt: user.createdAt.toISOString(),
      },
      profile: user.profile
        ? {
            age: user.profile.age,
            sex: user.profile.sex,
            height: user.profile.height,
            weight: user.profile.weight,
            activityLevel: user.profile.activityLevel,
            dietaryPreferences: user.profile.dietaryPreferences,
            constraints: user.profile.constraints,
          }
        : null,
      onboarding: user.onboarding
        ? {
            status: user.onboarding.status,
            goalData: user.onboarding.goalData,
            currentStateData: user.onboarding.currentStateData,
            routineData: user.onboarding.routineData,
          }
        : null,
      recentCheckins: user.checkins.map((c) => ({
        date: c.date.toISOString(),
        energy: c.energy,
        mood: c.mood,
        sleepQuality: c.sleepQuality,
        adherence: c.adherence,
        note: c.note,
      })),
    };

    return context;
  }

  // ------------- Chat reply -------------

  async generateChatReply(args: {
    userId: string;
    sessionId: string;
    userMessage: string;
  }): Promise<string> {
    const { userId, sessionId, userMessage } = args;

    // Ensure session belongs to user
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session || session.userId !== userId) {
      throw new InternalServerErrorException('Invalid session for user');
    }

    // Save user message first
    await this.prisma.message.create({
      data: {
        sessionId,
        role: 'user',
        content: userMessage,
      },
    });

    // Fetch last N messages (including the one we just saved)
    const HISTORY_LIMIT = 20;
    const messages = await this.prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: HISTORY_LIMIT,
    });

    const context = await this.buildUserContext(userId);

    const systemPrompt = `
You are "refla", an AI fitness and health coach.

Tone:
- Empathetic, direct, no-bullshit.
- You explain *why* you recommend things.
- You respect limits (injuries, medical conditions, time constraints).

Behaviour:
- Ask clarifying questions if user goal or constraints are unclear.
- Give specific, actionable advice: numbers, examples, routines.
- Never give medical advice that replaces a doctor; if something sounds risky, tell them to see a professional.

User context will be provided as JSON. Use it heavily:
- Use their goal, current state, and routine to tailor your answers.
- Use recent check-ins to comment on patterns (sleep, energy, adherence).
`.trim();

    const messagesForModel: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }> = [];

    // System prompt
    messagesForModel.push({
      role: 'system',
      content: systemPrompt,
    });

    // User context as a system message
    messagesForModel.push({
      role: 'system',
      content: `User context (JSON): ${JSON.stringify(context)}`,
    });

    // Conversation history
    for (const m of messages) {
      messagesForModel.push({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      });
    }

    const completion = await this.client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: messagesForModel,
      temperature: 0.7,
    });

    const assistantMessage = completion.choices[0]?.message?.content?.trim();
    if (!assistantMessage) {
      this.logger.error('Empty assistant message from OpenAI');
      throw new InternalServerErrorException('AI returned empty response');
    }

    // Save assistant message
    await this.prisma.message.create({
      data: {
        sessionId,
        role: 'assistant',
        content: assistantMessage,
      },
    });

    return assistantMessage;
  }

  // ------------- Plan generator -------------

  async generatePlan(args: { userId: string }): Promise<PlanData> {
    const { userId } = args;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        onboarding: true,
      },
    });

    if (!user || !user.onboarding) {
      throw new InternalServerErrorException('User or onboarding not found for plan generation');
    }

    if (user.onboarding.status !== OnboardingStatus.completed) {
      this.logger.warn(`generatePlan called for user ${userId} with incomplete onboarding`);
    }

    const context = await this.buildUserContext(userId);

    const systemPrompt = `
You are "refla", an AI fitness and health coach.

Your job now is to generate a structured, realistic fitness & lifestyle plan for the user.
You MUST return a single valid JSON object, matching this TypeScript interface:

interface TrainingDay {
  day: string;
  focus: string;
  durationMinutes: number;
  exercises: string[];
  notes?: string;
}

interface NutritionGuidelines {
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  mealsPerDay: number;
  notes?: string;
  sampleMeals?: string[];
}

interface SleepAndRecovery {
  targetSleepHours: number;
  sleepWindow: string;
  preSleepRoutine: string[];
  recoveryPractices: string[];
}

interface Habit {
  name: string;
  description: string;
  frequency: "daily" | "weekly" | "on_demand";
}

interface PlanData {
  summary: string;
  keyFocuses: string[];
  training: TrainingDay[];
  nutrition: NutritionGuidelines;
  sleepRecovery: SleepAndRecovery;
  habits: Habit[];
}

Rules:
- Output ONLY the JSON. No backticks, no markdown, no explanations.
- Ensure all required fields are present and types are correct.
- Tailor to the user's goal, constraints, and routine.
`.trim();

    const userMessage = `
Here is the user context as JSON:

${JSON.stringify(context, null, 2)}

Generate a PlanData JSON object for this user.
`.trim();

    const completion = await this.client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
    });

    let content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new InternalServerErrorException('Empty plan generated by AI');
    }

    // In case the model ignores instruction and wraps in ```json ```
    content = this.stripMarkdownFence(content);

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      this.logger.error('Failed to parse plan JSON from AI', err as any);
      throw new InternalServerErrorException('Failed to parse AI plan JSON');
    }

    // Optionally you can add runtime validation here.
    return parsed as PlanData;
  }

  // ------------- helpers -------------

  private stripMarkdownFence(content: string): string {
    if (content.startsWith('```')) {
      // remove ```json ... ```
      return content
        .replace(/^```[a-zA-Z]*\n/, '')
        .replace(/```$/, '')
        .trim();
    }
    return content;
  }
}
