import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT 鉴权守卫，依赖 JwtStrategy（passport-jwt）校验 Bearer Token。
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
