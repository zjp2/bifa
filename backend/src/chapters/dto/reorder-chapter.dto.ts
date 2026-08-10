import { IsInt } from 'class-validator';

export class ReorderChapterDto {
  @IsInt()
  sortOrder: number;
}
