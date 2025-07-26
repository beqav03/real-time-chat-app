import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserPayload } from '../common/interfaces/user-payload.interface';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your_jwt_secret_key', 
    });
  }

  async validate(payload: UserPayload) {
    const user = await this.usersService.findOne(payload.userId);
    if (user) {
      return { userId: payload.userId, username: payload.username };
    }
    return null;
  }
}
