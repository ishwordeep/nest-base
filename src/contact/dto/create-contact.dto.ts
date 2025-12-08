import { IsEmail, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @Length(2, 80)
  name: string;

  @IsEmail()
  @MaxLength(120)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(25)
  phone?: string;

  @IsString()
  @Length(3, 100)
  subject: string;

  @IsString()
  @Length(5, 2000)
  message: string;
}
