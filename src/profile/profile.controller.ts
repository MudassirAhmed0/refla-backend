import {
    Controller,
    Get,
    UseGuards,
    Req,
    Put,
    Body,
  } from '@nestjs/common';
  import { JwtAuthGuard } from '@/auth/jwt.guard';
  import { ProfileService } from './profile.service';
  import { UpdateProfileDto } from './dto/update-profile.dto';
  
  @Controller()
  export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}
  
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@Req() req: any) {
      return this.profileService.getMe(req.user.id);
    }
  
    @UseGuards(JwtAuthGuard)
    @Put('me/profile')
    async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
      return this.profileService.updateProfile(req.user.id, dto);
    }
  }
  