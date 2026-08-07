import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateJournalDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;
}
