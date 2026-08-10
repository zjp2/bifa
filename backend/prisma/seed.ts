/**
 * 墨笺 · Inkwell Journal 种子脚本
 * 插入测试用户与示例数据（2 本日记本 / 3 个章节 / 4 篇日记）。
 *
 * 运行：npm run db:seed
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as bcrypt from 'bcrypt';
import * as path from 'node:path';

/** 与 PrismaService 一致的数据库地址解析（file: URL → 绝对路径） */
function resolveDbUrl(): string {
  const rawUrl = process.env.DATABASE_URL ?? 'file:./dev.db';
  let url = rawUrl;
  if (url.startsWith('file:')) {
    const rel = url.slice('file:'.length);
    const abs = path.isAbsolute(rel) ? rel : path.resolve(process.cwd(), rel);
    url = 'file:' + abs;
  }
  return url;
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: resolveDbUrl() }),
});

async function main() {
  const password = await bcrypt.hash('password123', 10);

  // 测试用户（重复运行时保持幂等）
  const user = await prisma.user.upsert({
    where: { email: 'demo@inkwell.com' },
    update: { password },
    create: { name: '墨客', email: 'demo@inkwell.com', password },
  });

  // 清空该用户既有的日记本（级联清空 chapters / entries），保证种子幂等
  await prisma.journal.deleteMany({ where: { ownerId: user.id } });

  // —— 日记本 1：闲情偶寄 ——
  const journal1 = await prisma.journal.create({
    data: {
      ownerId: user.id,
      name: '闲情偶寄',
      description: '日常所思所记，笔墨随心动。',
      color: '#8a2f1f',
      sortOrder: 0,
    },
  });

  const ch1 = await prisma.chapter.create({
    data: { journalId: journal1.id, name: '甲辰春', sortOrder: 0 },
  });
  await prisma.entry.create({
    data: {
      chapterId: ch1.id,
      title: '初春微雨',
      subtitle: '夜读偶得',
      content: '<p>夜来微雨，晨起推窗，满目新绿。案上残卷未合，墨痕犹湿。</p>',
      tags: ['春', '雨'],
      date: new Date('2024-03-12'),
    },
  });
  await prisma.entry.create({
    data: {
      chapterId: ch1.id,
      title: '读《陶庵梦忆》',
      subtitle: '张岱笔底风物',
      content: '<p>张岱笔下风物，皆成绝响。昔人闲情，今不可复得矣。</p>',
      tags: ['读书', '随笔'],
      date: new Date('2024-03-18'),
    },
  });

  // —— 日记本 2：代码札记 ——
  const journal2 = await prisma.journal.create({
    data: {
      ownerId: user.id,
      name: '代码札记',
      description: '技术片段与思考。',
      color: '#9a7b3a',
      sortOrder: 1,
    },
  });

  const ch2 = await prisma.chapter.create({
    data: { journalId: journal2.id, name: 'NestJS', sortOrder: 0 },
  });
  await prisma.entry.create({
    data: {
      chapterId: ch2.id,
      title: 'Prisma 7 Driver Adapter',
      subtitle: '连接数据库的新方式',
      content: '<p>Prisma 7 移除内置查询引擎，运行时需通过 driver adapter 连接数据库。</p>',
      tags: ['NestJS', 'Prisma'],
      date: new Date('2024-04-01'),
    },
  });

  const ch3 = await prisma.chapter.create({
    data: { journalId: journal2.id, name: 'TypeScript', sortOrder: 1 },
  });
  await prisma.entry.create({
    data: {
      chapterId: ch3.id,
      title: 'isolatedModules 与 import type',
      content: '<p>开启 isolatedModules + emitDecoratorMetadata 时，类型导入需使用 import type。</p>',
      tags: ['TypeScript'],
      date: new Date('2024-04-05'),
    },
  });

  console.log('✅ 种子数据已插入');
  console.log(`   测试账号：demo@inkwell.com / password123`);
  console.log(`   日记本：${journal1.name}、${journal2.name}`);
}

main()
  .catch((e) => {
    console.error('❌ 种子脚本执行失败：', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
