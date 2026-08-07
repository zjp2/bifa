import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { ReorderChapterDto } from './dto/reorder-chapter.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import type { AuthUser } from '../auth/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateChapterDto) {
    return this.chaptersService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateChapterDto,
  ) {
    return this.chaptersService.update(user.id, id, dto);
  }

  @Patch(':id/reorder')
  reorder(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: ReorderChapterDto,
  ) {
    return this.chaptersService.reorder(user.id, id, dto.sortOrder);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.chaptersService.remove(user.id, id);
  }
}
