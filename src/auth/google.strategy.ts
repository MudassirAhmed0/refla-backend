import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: config.get<string>('oauth.googleClientId')!,
      clientSecret: config.get<string>('oauth.googleClientSecret')!,
      callbackURL: config.get<string>('oauth.googleCallbackUrl'),
      scope: ['email', 'profile'],
    });
  }

  // This runs after Google redirects back with the user info
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    // Don't issue JWT here, just return user+token payload
    const result = await this.authService.validateGoogleLogin(profile);
    // This becomes req.user in the controller
    return result;
  }
}
