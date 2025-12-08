// about.dto.ts
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

/* ---------------------- Sub DTOs ---------------------- */

export class StatDto {
  @IsString()
  @IsNotEmpty()
  number: string;

  @IsString()
  @IsNotEmpty()
  label: string;
}

export class HeroSectionDto {
  @IsString()
  @IsNotEmpty()
  mainTitle: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsString()
  @IsOptional()
  buttonText?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatDto)
  stats: StatDto[];
}

// Mission / Vision
export class StatementDto {
  @IsString()
  @IsNotEmpty()
  icon: string;

  @IsString()
  @IsOptional()
  iconBackgroundColor?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class ProductStoryItemDto {
  @IsNumber()
  year: number;

  @IsString()
  @IsNotEmpty()
  milestoneTitle: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class TeamMemberDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  titleRole: string;

  @IsString()
  @IsOptional()
  shortBio?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class CoreValueDto {
  @IsString()
  @IsNotEmpty()
  icon: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

/* ---------------------- MAIN DTO ---------------------- */

export class CreateAboutDto {
  @ValidateNested()
  @Type(() => HeroSectionDto)
  hero: HeroSectionDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatementDto)
  statements: StatementDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductStoryItemDto)
  productStory: ProductStoryItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamMemberDto)
  team: TeamMemberDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoreValueDto)
  coreValues: CoreValueDto[];
}

/* ---------------------- UPDATE DTO ---------------------- */

export class UpdateAboutDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => HeroSectionDto)
  hero?: HeroSectionDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatementDto)
  statements?: StatementDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductStoryItemDto)
  productStory?: ProductStoryItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamMemberDto)
  team?: TeamMemberDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoreValueDto)
  coreValues?: CoreValueDto[];
}
