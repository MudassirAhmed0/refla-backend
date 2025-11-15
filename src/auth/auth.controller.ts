import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
  import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt.guard';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.auth.signup(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  // ---- GOOGLE OAUTH ----

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
   
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    // req.user comes from GoogleStrategy.validate
    const { accessToken, user } = req.user as any;

    const frontendUrl = this.config.get<string>('frontend.url')!;
    const redirectUrl = `${frontendUrl}/auth/callback?token=${accessToken}`;

    // Option 1: redirect back to frontend with JWT in query
    return res.redirect(redirectUrl);

    // Option 2 (if you want pure JSON instead of redirect):
    // return res.json({ accessToken, user });
  }

  // Example protected route (sanity check for JWT + Google + local)
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: any) {
    return req.user;
  }
}
