import { IsString, MaxLength } from 'class-validator';

export class CreateChapterDto {
  @IsString()
  journalId: string;

  @IsString()
  @MaxLength(100)
  name: string;
}
