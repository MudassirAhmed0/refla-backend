import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AiService } from '@/ai/ai.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async createSession(userId: string, dto: CreateSessionDto) {
    const session = await this.prisma.session.create({
      data: {
        userId,
        type: dto.type,
        status: 'active',
      },
    });

    return session;
  }

  async getUserSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  private async assertSessionOwnership(userId: string, sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('You do not have access to this session');
    }

    return session;
  }

  async getSessionMessages(userId: string, sessionId: string) {
    await this.assertSessionOwnership(userId, sessionId);

    const messages = await this.prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });

    return messages;
  }

  async sendMessage(userId: string, sessionId: string, dto: CreateMessageDto) {
    await this.assertSessionOwnership(userId, sessionId);

    // Let AiService handle saving user + assistant messages as per 0.7
    const assistantMessage = await this.aiService.generateChatReply({
      userId,
      sessionId,
      userMessage: dto.content,
    });

    return {
      userMessage: dto.content,
      assistantMessage,
    };
  }
}
