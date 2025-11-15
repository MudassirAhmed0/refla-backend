import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/jwt.guard';
import { CheckinsService } from './checkins.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { GetCheckinsQueryDto } from './dto/get-checkins-query.dto';

@Controller('checkins')
@UseGuards(JwtAuthGuard)
export class CheckinsController {
  constructor(private readonly checkinsService: CheckinsService) {}

  @Post()
  async createCheckin(@Req() req: any, @Body() dto: CreateCheckinDto) {
    const userId = req.user.id;
    return this.checkinsService.createCheckin(userId, dto);
  }

  @Get()
  async getCheckins(@Req() req: any, @Query() query: GetCheckinsQueryDto) {
    const userId = req.user.id;
    return this.checkinsService.getCheckins(userId, query);
  }
}
