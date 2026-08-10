import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as path from 'node:path';

/**
 * 全局 Prisma 服务。
 *
 * Prisma 7 移除了内置查询引擎，运行时必须通过 driver adapter 连接数据库。
 * 这里使用 better-sqlite3 适配器连接 SQLite。
 */
function createAdapter(): PrismaBetterSqlite3 {
  const rawUrl = process.env.DATABASE_URL ?? 'file:./dev.db';
  let url = rawUrl;
  if (url.startsWith('file:')) {
    const rel = url.slice('file:'.length);
    const abs = path.isAbsolute(rel) ? rel : path.resolve(process.cwd(), rel);
    url = 'file:' + abs;
  }
  return new PrismaBetterSqlite3({ url });
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({ adapter: createAdapter() });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
