import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';

@Injectable()
export class JournalsService {
  constructor(private readonly prisma: PrismaService) {}

  /** 获取当前用户的所有日记本（含 chapters 与 entries） */
  findAll(userId: string) {
    return this.prisma.journal.findMany({
      where: { ownerId: userId },
      orderBy: { sortOrder: 'asc' },
      include: {
        chapters: {
          orderBy: { sortOrder: 'asc' },
          include: {
            entries: { orderBy: { date: 'desc' } },
          },
        },
      },
    });
  }

  create(userId: string, dto: CreateJournalDto) {
    return this.prisma.journal.create({
      data: {
        ownerId: userId,
        name: dto.name,
        description: dto.description,
        color: dto.color,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateJournalDto) {
    await this.assertOwned(userId, id);
    return this.prisma.journal.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.color !== undefined && { color: dto.color }),
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.assertOwned(userId, id);
    // 级联删除由 Prisma schema 的 onDelete: Cascade 保证
    await this.prisma.journal.delete({ where: { id } });
    return { id };
  }

  /** 校验日记本存在且归属当前用户 */
  private async assertOwned(userId: string, id: string) {
    const journal = await this.prisma.journal.findUnique({ where: { id } });
    if (!journal) {
      throw new NotFoundException('日记本不存在');
    }
    if (journal.ownerId !== userId) {
      throw new ForbiddenException('无权访问该日记本');
    }
    return journal;
  }
}
