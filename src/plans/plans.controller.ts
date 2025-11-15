import { Controller, Get, Post, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/jwt.guard';
import { PlansService } from './plans.service';

@Controller('plans')
@UseGuards(JwtAuthGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post('generate')
  async generatePlan(@Req() req: any) {
    const userId = req.user.id;
    return this.plansService.generatePlanForUser(userId);
  }

  @Get('active')
  async getActivePlan(@Req() req: any) {
    const userId = req.user.id;
    const plan = await this.plansService.getActivePlan(userId);

    if (!plan) {
      throw new NotFoundException('No active plan found');
    }

    return plan;
  }

  @Get()
  async getPlans(@Req() req: any) {
    const userId = req.user.id;
    return this.plansService.getPlans(userId);
  }
}
