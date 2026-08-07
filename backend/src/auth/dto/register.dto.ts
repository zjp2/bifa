import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @IsEmail()
  @MaxLength(120)
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(72)
  password: string;
}
