import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';

@Injectable()
export class ChaptersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateChapterDto) {
    await this.assertJournalOwned(userId, dto.journalId);
    return this.prisma.chapter.create({
      data: { journalId: dto.journalId, name: dto.name },
    });
  }

  async update(userId: string, id: string, dto: UpdateChapterDto) {
    await this.assertChapterOwned(userId, id);
    return this.prisma.chapter.update({
      where: { id },
      data: { ...(dto.name !== undefined && { name: dto.name }) },
    });
  }

  async reorder(userId: string, id: string, sortOrder: number) {
    await this.assertChapterOwned(userId, id);
    return this.prisma.chapter.update({
      where: { id },
      data: { sortOrder },
    });
  }

  async remove(userId: string, id: string) {
    await this.assertChapterOwned(userId, id);
    await this.prisma.chapter.delete({ where: { id } });
    return { id };
  }

  /** 校验日记本归属当前用户 */
  private async assertJournalOwned(userId: string, journalId: string) {
    const journal = await this.prisma.journal.findUnique({
      where: { id: journalId },
    });
    if (!journal) {
      throw new NotFoundException('日记本不存在');
    }
    if (journal.ownerId !== userId) {
      throw new ForbiddenException('无权操作该日记本');
    }
    return journal;
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
}
