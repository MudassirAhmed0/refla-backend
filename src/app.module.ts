import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from './config/configuration';
import { validationSchema } from './config/validation';

// Prisma
import { PrismaModule } from './prisma/prisma.module';

// Feature modules (we’ll implement them step by step)
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfileModule } from './profile/profile.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { SessionsModule } from './sessions/sessions.module';
import { PlansModule } from './plans/plans.module';
import { CheckinsModule } from './checkins/checkins.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      envFilePath: ['.env'],
    }),

    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ProfileModule,
    OnboardingModule,
    SessionsModule,
    PlansModule,
    CheckinsModule,
    AiModule,
  ],
})
export class AppModule {}
