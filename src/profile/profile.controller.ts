import {
    Controller,
    Get,
    UseGuards,
    Req,
    Put,
    Body,
    ForbiddenException,
  } from '@nestjs/common';
  import { JwtAuthGuard } from '@/auth/jwt.guard';
  import { ProfileService } from './profile.service';
  import { UpdateProfileDto } from './dto/update-profile.dto';
import { sanitizeUser } from '@/users/sanitize-user';
  
  @Controller()
  export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}
  
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@Req() req: any) {
        const user = await this.profileService.getMe(req.user.id);
        if(!user) throw new ForbiddenException("User Doesn't Exist")
        return sanitizeUser(user);
    }
  
    @UseGuards(JwtAuthGuard)
    @Put('me/profile')
    async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
      return this.profileService.updateProfile(req.user.id, dto);
    }
  }
  