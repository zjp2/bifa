import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @MaxLength(120)
  email: string;

  @IsString()
  password: string;
}
