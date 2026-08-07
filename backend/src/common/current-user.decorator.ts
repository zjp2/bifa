import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthUser } from '../auth/jwt.strategy';

/**
 * 从经过 JWT 守卫的请求中取出当前登录用户。
 * 用法：@CurrentUser() user: AuthUser
 * 或取单个字段：@CurrentUser('id') userId: string
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: AuthUser = request.user;
    return data ? user?.[data] : user;
  },
);
