import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { AiModule } from '@/ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}
