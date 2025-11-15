import { IsEnum } from 'class-validator';
import { SessionType } from '@prisma/client';

export class CreateSessionDto {
  @IsEnum(SessionType)
  type!: SessionType; // "onboarding" | "coaching"
}
