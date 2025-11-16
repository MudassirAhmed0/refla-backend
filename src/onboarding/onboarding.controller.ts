import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/jwt.guard';
import { OnboardingService } from './onboarding.service';
import { UpdateGoalDataDto } from './dto/update-goals.dto';
import { UpdateCurrentStateDto } from './dto/update-current-state.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get()
  async getOnboarding(@Req() req: any) {
    return this.onboardingService.getOnboarding(req.user.id);
  }

  @Put('goals')
  async updateGoals(@Req() req: any, @Body() dto: UpdateGoalDataDto) {
    return this.onboardingService.updateGoals(req.user.id, dto);
  }

  @Put('current-state')
  async updateCurrentState(@Req() req: any, @Body() dto: UpdateCurrentStateDto) {
    return this.onboardingService.updateCurrentState(req.user.id, dto);
  }

  @Put('routine')
  async updateRoutine(@Req() req: any, @Body() dto: UpdateRoutineDto) {
    return this.onboardingService.updateRoutine(req.user.id, dto);
  }
}
