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
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  textColor: string;

  @IsString()
  @IsOptional()
  bgColor: string;

  @IsString()
  @IsOptional()
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

  @IsOptional()
  @ValidateNested()
  @Type(() => ButtonDto)
  button?: ButtonDto;
}
