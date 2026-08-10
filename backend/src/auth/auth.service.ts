import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './jwt.strategy';

/** 鉴权接口返回给前端的用户信息（不含密码） */
export type SafeUser = {
  id: string;
  name: string;
  email: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) {
      throw new ConflictException('该邮箱已被注册');
    }
    // 密码用 bcrypt.hash(password, 10) 加盐哈希
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
      },
    });
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }
    return this.buildAuthResponse(user);
  }

  async getMe(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return { id: user.id, name: user.name, email: user.email };
  }

  private buildAuthResponse(user: {
    id: string;
    name: string;
    email: string;
  }) {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);
    return {
      access_token,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }
}
