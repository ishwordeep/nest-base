import { IsNotEmpty, IsString, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { FAQ } from '../schema/create.schema';

export class CreateFaqItemDto implements Omit<FAQ, '_id'> {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}

export class CreateProductFaqDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFaqItemDto)
  faqs: CreateFaqItemDto[];
}
