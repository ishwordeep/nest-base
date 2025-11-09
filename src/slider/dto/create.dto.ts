import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// Define the Button DTO
export class ButtonDto {
  @IsString()
  title: string;

  @IsString()
  textColor: string;

  @IsString()
  @IsNotEmpty()
  bgColor: string;

  @IsString()
  link: string;
}

export class CreateSliderDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  displayOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isButtonEnabled?: boolean;

  @ValidateNested()
  @Type(() => ButtonDto)
  @IsNotEmpty()
  button: ButtonDto;
}
