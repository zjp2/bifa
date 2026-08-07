import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JournalsModule } from './journals/journals.module';
import { ChaptersModule } from './chapters/chapters.module';
import { EntriesModule } from './entries/entries.module';

@Module({
  imports: [
    // 全局加载 .env 环境变量
    ConfigModule.forRoot({ isGlobal: true }),
    // 全局 Prisma 服务
    PrismaModule,
    AuthModule,
    JournalsModule,
    ChaptersModule,
    EntriesModule,
  ],
})
export class AppModule {}
