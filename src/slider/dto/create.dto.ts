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
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  textColor: string;

  @IsString()
  @IsNotEmpty()
  bgColor: string;

  @IsString()
  url: string;
}

export class CreateSliderDto {
  @IsString()
  @IsNotEmpty()
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

  @ValidateNested()
  @Type(() => ButtonDto)
  @IsNotEmpty()
  button: ButtonDto;
}
