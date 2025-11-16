import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/jwt.guard';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  async createSession(@Req() req: any, @Body() dto: CreateSessionDto) {
    const userId = req.user.id;
    return this.sessionsService.createSession(userId, dto);
  }

  @Get()
  async getSessions(@Req() req: any) {
    const userId = req.user.id;
    return this.sessionsService.getUserSessions(userId);
  }

  @Get(':id/messages')
  async getSessionMessages(@Req() req: any, @Param('id') sessionId: string) {
    const userId = req.user.id;
    return this.sessionsService.getSessionMessages(userId, sessionId);
  }

  @Post(':id/messages')
  async sendMessage(
    @Req() req: any,
    @Param('id') sessionId: string,
    @Body() dto: CreateMessageDto,
  ) {
    const userId = req.user.id;
    return this.sessionsService.sendMessage(userId, sessionId, dto);
  }
}
