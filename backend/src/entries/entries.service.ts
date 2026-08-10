import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import type { Entry, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';

/** 返回给前端的条目（tags 归一化为 string[]） */
type EntryWithTags = Omit<Entry, 'tags'> & { tags: string[] };

@Injectable()
export class EntriesService {
  constructor(private readonly prisma: PrismaService) {}

  /** 获取章节下的日记条目 */
  async findByChapter(userId: string, chapterId: string) {
    if (!chapterId) {
      throw new BadRequestException('缺少 chapterId 查询参数');
    }
    await this.assertChapterOwned(userId, chapterId);
    const entries = await this.prisma.entry.findMany({
      where: { chapterId },
      orderBy: { date: 'desc' },
    });
    return entries.map((e) => this.normalize(e));
  }

  async create(userId: string, dto: CreateEntryDto) {
    await this.assertChapterOwned(userId, dto.chapterId);
    const entry = await this.prisma.entry.create({
      data: {
        chapterId: dto.chapterId,
        title: dto.title,
        subtitle: dto.subtitle,
        content: dto.content,
        tags: dto.tags ?? [],
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
    return this.normalize(entry);
  }

  async findOne(userId: string, id: string) {
    const entry = await this.assertEntryOwned(userId, id);
    return this.normalize(entry);
  }

  async update(userId: string, id: string, dto: UpdateEntryDto) {
    await this.assertEntryOwned(userId, id);
    const entry = await this.prisma.entry.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.subtitle !== undefined && { subtitle: dto.subtitle }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        ...(dto.date !== undefined && { date: new Date(dto.date) }),
      },
    });
    return this.normalize(entry);
  }

  async remove(userId: string, id: string) {
    await this.assertEntryOwned(userId, id);
    await this.prisma.entry.delete({ where: { id } });
    return { id };
  }

  /** 校验章节所属的 journal 归当前用户所有 */
  private async assertChapterOwned(userId: string, chapterId: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { journal: true },
    });
    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }
    if (chapter.journal.ownerId !== userId) {
      throw new ForbiddenException('无权操作该章节');
    }
    return chapter;
  }

  /** 校验条目所属链路（entry -> chapter -> journal）归当前用户所有 */
  private async assertEntryOwned(userId: string, entryId: string) {
    const entry = await this.prisma.entry.findUnique({
      where: { id: entryId },
      include: { chapter: { include: { journal: true } } },
    });
    if (!entry) {
      throw new NotFoundException('日记条目不存在');
    }
    if (entry.chapter.journal.ownerId !== userId) {
      throw new ForbiddenException('无权操作该条目');
    }
    return entry;
  }

  /** 将 Json 类型的 tags 归一化为 string[] */
  private normalize(entry: Entry): EntryWithTags {
    return { ...entry, tags: this.parseTags(entry.tags) };
  }

  private parseTags(tags: Prisma.JsonValue): string[] {
    return Array.isArray(tags) ? (tags as string[]) : [];
  }
}
