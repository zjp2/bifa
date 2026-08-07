import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

/** JWT 载荷结构 */
export interface JwtPayload {
  sub: string; // user id
  email: string;
}

/** 注入到 request.user 的用户对象（不含密码） */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // 密钥从环境变量读取，默认 fallback 到开发密钥
      secretOrKey:
        configService.get<string>('JWT_SECRET') ?? 'inkwell-dev-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('用户不存在或令牌已失效');
    }
    // 不返回密码
    const { password: _password, ...result } = user;
    return result;
  }
}
